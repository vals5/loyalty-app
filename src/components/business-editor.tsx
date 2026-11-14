"use client";
import { useEffect, useState } from "react";
import { getDocs, query, Timestamp, where } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { Check, CheckCheck, CircleCheck, Copy, ExternalLink, Gift, IdCard, Loader2, Palette, QrCode, Shapes, Target, Users } from "lucide-react";
import { WalletCard } from "@/components/card/wallet-card";
import { OwnerGate } from "@/components/shared/owner-gate";
import { AccordionPanel } from "@/components/shared/accordion-panel";
import { inputCls } from "@/components/shared/panel";
import { updateBusiness } from "@/lib/firebase/businesses";
import { cardsCol, historyCol } from "@/lib/firebase/collections";
import { STAMP_TYPES } from "@/lib/stamp-types";
import { WHEEL_COLORS, onBrand } from "@/lib/color";
import { STAMP_CELL, STAMP_GRID } from "@/lib/stamp-layout";
import type { Business, RewardLevel } from "@/lib/firebase/types";

const SIZES = [6, 8, 10, 12];
const chip = "inline-flex items-center gap-1.5 rounded-full border border-borde bg-white px-3 py-1.5 text-xs font-bold text-texto";

export function BusinessEditor() {
  return <OwnerGate>{(b) => <Editor key={b.slug} initial={b} />}</OwnerGate>;
}

function useStats(slug: string) {
  const [stats, setStats] = useState<{ clients: number; today: number; redeemed: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    Promise.all([
      getDocs(cardsCol(slug)),
      getDocs(query(historyCol(slug), where("createdAt", ">=", Timestamp.fromDate(start)))),
    ])
      .then(([cards, today]) => {
        if (cancelled) return;
        setStats({
          clients: cards.size,
          redeemed: cards.docs.reduce((n, d) => n + d.data().redeemedCount, 0),
          today: today.docs.reduce((n, d) => (d.data().type === "stamp" ? n + d.data().amount : n), 0),
        });
      })
      .catch(() => { if (!cancelled) setStats({ clients: 0, today: 0, redeemed: 0 }); });
    return () => { cancelled = true; };
  }, [slug]);
  return stats;
}

type Draft = {
  name: string; color: string; stampIcon: string; required: number; reward: string;
  description: string; address: string; hours: string; phone: string; extra: RewardLevel[];
};

/** Forma normalizada de lo que se guarda: sirve para saber si hubo cambios reales. */
function normalize(d: Draft): Draft {
  return {
    name: d.name.trim(), color: d.color.toLowerCase(), stampIcon: d.stampIcon, required: d.required, reward: d.reward.trim(),
    description: d.description.trim(), address: d.address.trim(), hours: d.hours.trim(), phone: d.phone.trim(),
    extra: d.extra.filter((r) => r.at < d.required).map((r) => ({ at: r.at, name: r.name.trim() })).sort((a, b) => a.at - b.at),
  };
}

function fromBusiness(b: Business): Draft {
  return normalize({
    name: b.name, color: b.primaryColor, stampIcon: b.stampIcon ?? "general", required: b.stampsRequired, reward: b.reward,
    description: b.description ?? "", address: b.address ?? "", hours: b.hours ?? "", phone: b.phone ?? "", extra: b.extraRewards ?? [],
  });
}

function Editor({ initial }: { initial: Business }) {
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.primaryColor);
  const [stampIcon, setStampIcon] = useState(initial.stampIcon ?? "general");
  const [required, setRequired] = useState(initial.stampsRequired);
  const [extra, setExtra] = useState<RewardLevel[]>(() => (initial.extraRewards ?? []).filter((r) => r.at < initial.stampsRequired));
  const [formError, setFormError] = useState<string | null>(null);
  const [reward, setReward] = useState(initial.reward);
  const [description, setDescription] = useState(initial.description ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [hours, setHours] = useState(initial.hours ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(null); // un solo desplegable abierto a la vez
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  const [saved, setSaved] = useState<Draft>(() => fromBusiness(initial)); // lo último guardado en Firestore
  const dirty = JSON.stringify(normalize({ name, color, stampIcon, required, reward, description, address, hours, phone, extra })) !== JSON.stringify(saved);
  const stats = useStats(initial.slug);
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/c/${initial.slug}`;

  function chooseRequired(n: number) {
    setRequired(n);
    setExtra((prev) => prev.filter((r) => r.at < n)); // si achica la tarjeta, se quitan los sellos que ya no existen
  }
  function toggleLevel(at: number) {
    setExtra((prev) => (prev.some((r) => r.at === at) ? prev.filter((r) => r.at !== at) : [...prev, { at, name: "" }].sort((a, b) => a.at - b.at)));
  }
  function renameLevel(at: number, text: string) {
    setExtra((prev) => prev.map((r) => (r.at === at ? { ...r, name: text } : r)));
  }

  async function save() {
    const levels = extra.filter((r) => r.at < required);
    const empty = levels.find((r) => !r.name.trim());
    if (empty) {
      setFormError(`Escribí la recompensa del sello ${empty.at} o quitá ese sello.`);
      setOpen("reglas"); // abre la sección donde está el error
      return;
    }
    setFormError(null);
    setStatus("saving");
    try {
      const payload = {
        name: name.trim() || initial.name, primaryColor: color, stampsRequired: required, reward: reward.trim() || initial.reward,
        extraRewards: levels.map((r) => ({ at: r.at, name: r.name.trim() })),
        stampIcon, description: description.trim() || null, address: address.trim() || null, hours: hours.trim() || null, phone: phone.trim() || null,
      };
      await updateBusiness(initial.slug, payload);
      // Lo que se ve queda igual a lo guardado, y eso pasa a ser el nuevo punto de comparación
      setName(payload.name);
      setReward(payload.reward);
      setExtra(payload.extraRewards);
      setSaved(fromBusiness({ ...initial, ...payload }));
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }


  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold text-texto">Mi negocio</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={chip}><Users className="size-3.5" /> {stats?.clients ?? "–"} clientes</span>
          <span className={chip}><CheckCheck className="size-3.5" /> {stats?.today ?? "–"} sellos hoy</span>
          <span className={chip}><Gift className="size-3.5" /> {stats?.redeemed ?? "–"} canjeados</span>
        </div>
      </header>

      <section>
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-texto"><span className="size-2 rounded-full bg-emerald-500" /> VISTA PREVIA EN VIVO</span>
          <span className="font-medium text-texto-sec">Actualización instantánea</span>
        </div>
        <WalletCard name={name || "Tu negocio"} color={color} reward={reward || "Tu premio"} required={required} filled={Math.ceil(required * 0.4)} typeKey={stampIcon} rewardAt={[...extra.filter((r) => r.at < required).map((r) => r.at), required]} />
      </section>

      <AccordionPanel id="tipo" open={open === "tipo"} onToggle={() => toggle("tipo")} icon={Shapes} title="Tipo de negocio y sello" subtitle="Elegí el ícono que se graba en cada visita" summary={STAMP_TYPES.find((t) => t.key === stampIcon)?.label}>
        <div className="grid grid-cols-4 gap-2">
          {STAMP_TYPES.map((t) => (
            <button key={t.key} type="button" onClick={() => setStampIcon(t.key)} aria-pressed={stampIcon === t.key}
              className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${stampIcon === t.key ? "bg-boton text-white" : "border border-borde bg-white text-texto"}`}>
              <t.icon className="size-5" />{t.label}
            </button>
          ))}
        </div>
      </AccordionPanel>

      <AccordionPanel id="color" open={open === "color"} onToggle={() => toggle("color")} icon={Palette} title="Color y estilo de la tarjeta" subtitle="Elegí el color principal de tu tarjeta" summary={<span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: color }} />{WHEEL_COLORS.find((w) => w.color === color.toLowerCase())?.name ?? "Color propio"}</span>}>
        <p className="mb-2 text-xs font-bold text-texto">Colores</p>
        <div className="grid grid-cols-6 gap-2.5" role="radiogroup" aria-label="Colores de la rueda cromática">
          {WHEEL_COLORS.map((w) => {
            const active = color.toLowerCase() === w.color;
            return (
              <button key={w.color} type="button" role="radio" aria-checked={active} aria-label={w.name} title={w.name} onClick={() => setColor(w.color)}
                style={{ background: w.color }}
                className={`grid aspect-square place-items-center rounded-full transition-transform active:scale-90 ${active ? "ring-2 ring-boton ring-offset-2" : "ring-1 ring-black/10"}`}>
                {active && <Check className="size-4" strokeWidth={3} style={{ color: onBrand(w.color) }} />}
              </button>
            );
          })}
        </div>
      </AccordionPanel>

      <AccordionPanel id="identidad" open={open === "identidad"} onToggle={() => toggle("identidad")} icon={IdCard} title="Identidad y marca" subtitle="Nombre y datos que ven tus clientes" summary={[name, address].filter(Boolean).join(" · ")}>
        <div className="space-y-3">
          <label className="block text-xs font-bold text-texto">Nombre comercial en la tarjeta<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={`${inputCls} mt-1.5 font-normal`} /></label>
          <label className="block text-xs font-bold text-texto">Descripción<textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={160} rows={2} className={`${inputCls} mt-1.5 py-3 font-normal`} /></label>
          <label className="block text-xs font-bold text-texto">Dirección<input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={100} className={`${inputCls} mt-1.5 font-normal`} /></label>
          <label className="block text-xs font-bold text-texto">Horarios<input value={hours} onChange={(e) => setHours(e.target.value)} maxLength={80} placeholder="Lun a Sáb 8:00 – 20:00" className={`${inputCls} mt-1.5 font-normal`} /></label>
          <label className="block text-xs font-bold text-texto">Teléfono<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={24} className={`${inputCls} mt-1.5 font-normal`} /></label>
        </div>
      </AccordionPanel>

      <AccordionPanel id="reglas" open={open === "reglas"} onToggle={() => toggle("reglas")} icon={Target} title="Reglas de sellos y recompensas" subtitle="Establecé la meta de visitas y el premio final" summary={`${required} sellos · ${reward}`}>
        <p className="text-xs font-bold text-texto">Sellos necesarios para completar</p>
        <div className="mt-2 grid grid-cols-4 gap-2" role="radiogroup">
          {SIZES.map((n) => (
            <button key={n} type="button" role="radio" aria-checked={required === n} onClick={() => chooseRequired(n)}
              className={`min-h-12 rounded-xl text-sm font-bold transition-all active:scale-95 ${required === n ? "bg-boton text-white" : "border border-borde bg-white text-texto"}`}>{n}</button>
          ))}
        </div>
        <label className="mt-4 block text-xs font-bold text-texto">Recompensa final principal<input value={reward} onChange={(e) => setReward(e.target.value)} maxLength={48} className={`${inputCls} mt-1.5 font-normal`} /></label>

        <p className="mt-5 text-xs font-bold text-texto">Recompensas intermedias</p>
        <p className="text-xs text-texto-sec">Tocá los sellos que quieras premiar. El último ya lleva la recompensa final.</p>
        <ol className={`mt-3 ${STAMP_GRID}`} aria-label="Elegí los sellos con recompensa">
          {Array.from({ length: required }, (_, i) => {
            const n = i + 1;
            const isFinal = n === required;
            const picked = isFinal || extra.some((r) => r.at === n);
            return (
              <li key={n} className={STAMP_CELL}>
                <button type="button" disabled={isFinal} aria-pressed={picked} aria-label={isFinal ? `Sello ${n}: recompensa final` : `Sello ${n}${picked ? ": con recompensa" : ""}`} onClick={() => toggleLevel(n)}
                  className={`grid aspect-square w-full place-items-center rounded-xl text-sm font-bold transition-all active:scale-95 ${picked ? "bg-boton text-white" : "border border-borde bg-white text-texto"} ${isFinal ? "opacity-60" : ""}`}>
                  {picked ? <Gift className="size-5" /> : n}
                </button>
              </li>
            );
          })}
        </ol>
        {extra.length > 0 && (
          <div className="mt-3 space-y-3">
            {extra.map((r) => (
              <label key={r.at} className="block text-xs font-bold text-texto">Recompensa del sello {r.at}
                <input value={r.name} onChange={(e) => renameLevel(r.at, e.target.value)} maxLength={48} placeholder="Ej: Café gratis" className={`${inputCls} mt-1.5 font-normal`} />
              </label>
            ))}
          </div>
        )}
      </AccordionPanel>

      <AccordionPanel id="compartir" open={open === "compartir"} onToggle={() => toggle("compartir")} icon={QrCode} title="Compartí tu tarjeta" subtitle="Tus clientes escanean este QR para crear la suya" summary="Link y código QR">
        <div className="mx-auto w-fit rounded-2xl border border-borde bg-white p-3">{link && <QRCodeSVG value={link} size={150} marginSize={0} />}</div>
        <p className="mt-3 break-all rounded-xl border border-borde bg-white px-3 py-2 text-center text-xs font-medium text-texto select-all">{link}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}
            className="flex min-h-11 items-center gap-2 rounded-full border border-borde bg-white px-4 text-xs font-bold text-texto"><Copy className="size-3.5" /> {copied ? "Link copiado" : "Copiar link"}</button>
          <a href={link} target="_blank" rel="noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-full bg-boton px-4 text-xs font-bold text-white"><ExternalLink className="size-3.5" /> Abrir tarjeta</a>
        </div>
        <p className="mt-3 text-center text-xs text-texto-sec">Para verla como cliente, abrila en una ventana privada.</p>
        {link.includes("localhost") && <p className="mt-2 rounded-xl bg-white px-3 py-2 text-center text-xs text-texto-sec ring-1 ring-borde">Estás en localhost: este link y el QR solo funcionan en esta computadora. Para probar desde otro celular hay que publicar la app.</p>}
      </AccordionPanel>

      {formError && <p role="alert" className="rounded-xl border border-error/20 bg-error-suave px-3 py-2.5 text-sm text-error">{formError}</p>}
      {status === "error" && <p role="alert" className="rounded-xl border border-error/20 bg-error-suave px-3 py-2.5 text-sm text-error">No se pudieron guardar los cambios. Revisá tu conexión e intentá de nuevo.</p>}
      {(dirty || status !== "idle") && (
        <button type="button" onClick={save} disabled={status === "saving"}
          className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white shadow-lg shadow-black/25 transition-all active:scale-[0.98] disabled:opacity-70 ${status === "saved" ? "bg-exito" : "bg-boton"}`}>
          {status === "saving" ? <Loader2 className="size-5 animate-spin" /> : <CircleCheck className="size-5" />}
          {status === "saved" ? "Cambios publicados" : "Guardar y publicar tarjeta"}
        </button>
      )}
    </div>
  );
}