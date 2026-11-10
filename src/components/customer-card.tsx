"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Check, Clock, Gift, Loader2, Lock, MapPin, Navigation, Phone, QrCode, Share2 } from "lucide-react";
import { WalletCard } from "@/components/card/wallet-card";
import { Panel, inputCls } from "@/components/shared/panel";
import { auth, db } from "@/lib/firebase/client";
import { buildQrPayload, businessDoc, cardDoc } from "@/lib/firebase/collections";
import { saveSlug } from "@/lib/my-cards";
import { stampType } from "@/lib/stamp-types";
import { rewardLevels } from "@/lib/rewards";
import type { Business, Card } from "@/lib/firebase/types";

function TopBar({ slug }: { slug?: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}/c/${slug}`;
    try {
      if (navigator.share) await navigator.share({ title: "Mi tarjeta de fidelidad", url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* el usuario canceló */ }
  }
  const btn = "grid size-10 place-items-center rounded-full border border-borde bg-white text-texto transition-transform active:scale-90";
  return (
    <div className="mb-4 flex items-center justify-between">
      <Link href="/tarjetas" aria-label="Volver a mis tarjetas" className={btn}><ArrowLeft className="size-5" /></Link>
      <h1 className="text-base font-extrabold text-texto">Detalle de tarjeta</h1>
      {slug ? <button onClick={share} aria-label={copied ? "Link copiado" : "Compartir"} className={btn}>{copied ? <Check className="size-5" /> : <Share2 className="size-5" />}</button> : <span className="size-10" />}
    </div>
  );
}

export function CustomerCard({ slug }: { slug: string }) {
  const [user, setUser] = useState<User | null>(null);
  // undefined = cargando, null = no existe
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Sesión: reutiliza la existente o entra como anónimo
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        signInAnonymously(auth).catch(() =>
          setError("No se pudo iniciar sesión. Revisá tu conexión.")
        );
      }
    });
  }, []);

  // Cuenta personal: el nombre ya viene cargado al crear la tarjeta
  useEffect(() => {
    if (user?.displayName) setName((n) => n || user.displayName || "");
  }, [user]);

  // 2) Datos públicos del comercio
  useEffect(() => {
    let cancelled = false;
    getDoc(businessDoc(slug))
      .then((snap) => {
        if (!cancelled) setBusiness(snap.exists() ? snap.data() : null);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el comercio.");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // 3) Tarjeta del cliente en tiempo real (se actualiza sola al escanear)
  useEffect(() => {
    if (!user || !business) return undefined;
    return onSnapshot(
      cardDoc(slug, user.uid),
      (snap) => setCard(snap.exists() ? snap.data() : null),
      () => setError("No se pudo cargar tu tarjeta.")
    );
  }, [slug, user, business]);

  // 4) Si ya tiene tarjeta, queda guardada en "Mis tarjetas" de este dispositivo
  useEffect(() => {
    if (card) saveSlug(slug);
  }, [card, slug]);

  async function createCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError(null);
    try {
      await setDoc(doc(db, "businesses", slug, "cards", user.uid), {
        customerUid: user.uid,
        businessSlug: slug,
        customerName: name.trim() || null,
        stamps: 0,
        totalStamps: 0,
        redeemedCount: 0,
        createdAt: serverTimestamp(),
        lastStampAt: null,
      } satisfies Record<keyof Card, unknown>);
    } catch {
      setError("No se pudo crear tu tarjeta. Intentá de nuevo.");
    } finally {
      setCreating(false);
    }
  }

  if (business === null) {
    return (
      <>
        <TopBar />
        <p className="text-center text-texto-sec">Este comercio no existe.</p>
      </>
    );
  }
  if (business === undefined || !user || card === undefined) {
    return (
      <>
        <TopBar />
        <div className="flex justify-center py-16">
          {error ? <p role="alert" className="text-sm text-error">{error}</p> : <Loader2 className="size-6 animate-spin text-texto-sec" />}
        </div>
      </>
    );
  }

  if (card === null) {
    return (
      <form onSubmit={createCard} className="space-y-4">
        <TopBar slug={slug} />
        <WalletCard name={business.name} color={business.primaryColor} reward={business.reward} required={business.stampsRequired} filled={0} typeKey={business.stampIcon} rewardAt={rewardLevels(business).map((l) => l.at)} />
        <Panel title="Creá tu tarjeta" subtitle="Es gratis y no necesitás cuenta.">
          <label htmlFor="customer-name" className="mb-2 block text-sm font-semibold text-texto">Tu nombre (opcional)</label>
          <input id="customer-name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          {error && <p role="alert" className="mt-3 rounded-xl border border-error/20 bg-error-suave px-3 py-2.5 text-sm text-error">{error}</p>}
          <button type="submit" disabled={creating} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-boton text-base font-bold text-white shadow-lg shadow-black/25 transition-transform active:scale-[0.98] disabled:opacity-60">
            {creating && <Loader2 className="size-5 animate-spin" />} Crear mi tarjeta
          </button>
        </Panel>
      </form>
    );
  }

  return <CardBody business={business} card={card} slug={slug} />;
}

function CardBody({ business, card, slug }: { business: Business; card: Card; slug: string }) {
  const required = business.stampsRequired;
  const ready = card.stamps >= required;
  const rewardsReady = Math.floor(card.stamps / required);
  const levels = rewardLevels(business);
  const type = stampType(business.stampIcon);
  const since = card.createdAt?.toDate?.().toLocaleDateString("es-AR", { month: "short", year: "numeric" });
  const code = card.customerUid.slice(0, 8).toUpperCase();
  const qr = buildQrPayload(slug, card.customerUid);
  const mapsQuery = business.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.address} ${business.name}`)}` : null;
  const [open, setOpen] = useState(false);

  // Cuando el comercio suma un sello mientras el QR está abierto, se cierra solo y se ve el sello nuevo
  const prev = useRef(card.stamps);
  useEffect(() => {
    if (card.stamps > prev.current) setOpen(false);
    prev.current = card.stamps;
  }, [card.stamps]);

  const chip = "rounded-full border border-borde bg-white px-2.5 py-1 text-[11px] font-bold text-texto";

  return (
    <div className="space-y-4">
      <TopBar slug={slug} />

      <section className="rounded-3xl bg-panel p-4 ring-1 ring-borde">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-borde"><type.icon className="size-6 text-texto" /></span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-texto">{business.name}</h2>
            <p className="line-clamp-2 text-xs text-texto-sec">{business.description ?? type.label}</p>
          </div>
        </div>
        {business.address && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-texto-sec"><MapPin className="size-3.5 shrink-0" /><span className="truncate">{business.address}</span></p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {since && <span className={chip}>Cliente desde {since}</span>}
          <span className={`${chip} ml-auto`}>#{code}</span>
        </div>
      </section>

      <WalletCard
        name={business.name} color={business.primaryColor} reward={business.reward} required={required} filled={card.stamps}
        typeKey={business.stampIcon} rewardAt={levels.map((l) => l.at)} headline={{ eyebrow: "Tarjeta de fidelidad", title: `Juntá ${required} sellos` }} progress
      />

      <Panel icon={QrCode} title="Presentar en caja" subtitle="Mostrá este código para que te sumen un sello.">
        <div className="mx-auto w-fit rounded-2xl border border-borde bg-white p-3">
          <QRCodeSVG value={qr} size={176} marginSize={0} />
        </div>
        <button onClick={() => setOpen(true)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-boton font-bold text-white transition-transform active:scale-[0.98]">
          <QrCode className="size-5" /> Ampliar para escanear
        </button>
      </Panel>

      <Panel title="Recompensas del plan" right={<span className="text-xs text-texto-sec">{levels.length} {levels.length === 1 ? "nivel disponible" : "niveles disponibles"}</span>}>
        <div className="space-y-2">
          {levels.map((lv, idx) => {
            const isFinal = idx === levels.length - 1;
            const reached = card.stamps >= lv.at;
            const missing = lv.at - card.stamps;
            return (
              <div key={lv.at} className="flex items-center gap-3 rounded-2xl border border-borde bg-white p-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full ${reached ? "bg-boton text-white" : "bg-panel text-texto-sec"}`}><Gift className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-widest text-texto-sec uppercase">
                    {isFinal ? "Hito final" : "Hito"} ({lv.at} {lv.at === 1 ? "sello" : "sellos"}){reached && <span className="ml-1.5 rounded-full bg-boton px-1.5 py-0.5 text-white">¡Listo!</span>}
                  </p>
                  <p className="truncate font-bold text-texto">{lv.name}</p>
                  {isFinal && rewardsReady > 1 && <p className="text-xs text-texto-sec">Tenés {rewardsReady} premios para canjear.</p>}
                  {!reached && <p className="text-xs text-texto-sec">Te faltan {missing} {missing === 1 ? "sello" : "sellos"}.</p>}
                </div>
                {reached ? (
                  <button onClick={() => setOpen(true)} className="shrink-0 rounded-full bg-boton px-4 py-2.5 text-xs font-bold text-white active:scale-95">Canjear</button>
                ) : (
                  <Lock className="size-5 shrink-0 text-texto-sec" aria-label="Bloqueado" />
                )}
              </div>
            );
          })}
        </div>
        {card.redeemedCount > 0 && <p className="mt-3 text-xs text-texto-sec">Ya canjeaste {card.redeemedCount} {card.redeemedCount === 1 ? "premio" : "premios"} acá.</p>}
      </Panel>

      {(business.address || business.hours || business.phone) && (
        <Panel title="Información del local">
          <div className="space-y-3">
            {business.address && (
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-borde"><MapPin className="size-4 text-texto" /></span>
                <div className="min-w-0 text-sm"><p className="font-bold text-texto">{business.address}</p>{mapsQuery && <a href={mapsQuery} target="_blank" rel="noreferrer" className="text-xs font-bold text-texto-sec underline">Abrir en Google Maps</a>}</div>
              </div>
            )}
            {business.hours && (
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-borde"><Clock className="size-4 text-texto" /></span>
                <p className="min-w-0 pt-1.5 text-sm font-bold text-texto">{business.hours}</p>
              </div>
            )}
            {(business.phone || mapsQuery) && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {business.phone && <a href={`tel:${business.phone}`} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde bg-white text-sm font-bold text-texto active:scale-[0.98]"><Phone className="size-4" /> Llamar</a>}
                {mapsQuery && <a href={mapsQuery} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde bg-white text-sm font-bold text-texto active:scale-[0.98]"><Navigation className="size-4" /> Cómo llegar</a>}
              </div>
            )}
          </div>
        </Panel>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Tu código QR" className="fixed inset-0 z-30 flex items-end bg-black/60" onClick={() => setOpen(false)}>
          <div className="mx-auto w-full max-w-md rounded-t-3xl bg-hoja p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-extrabold text-texto">Mostrá este código en caja</p>
            <p className="text-sm text-texto-sec">{ready ? `Para canjear tu premio en ${business.name}` : `Así te suman un sello en ${business.name}`}</p>
            <div className="mx-auto my-4 w-fit rounded-2xl border border-borde bg-white p-4"><QRCodeSVG value={qr} size={240} marginSize={0} /></div>
            <p className="text-xs font-semibold tracking-widest text-texto-sec">#{code}</p>
            <button onClick={() => setOpen(false)} className="mt-4 min-h-12 w-full rounded-2xl bg-boton font-bold text-white active:scale-[0.98]">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
