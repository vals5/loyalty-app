"use client";
import { useEffect, useState } from "react";
import { collection, doc, increment, onSnapshot, runTransaction, serverTimestamp, writeBatch } from "firebase/firestore";
import { ArrowLeft, BadgeCheck, CircleAlert, CircleCheck, Gift, Loader2, PlusCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase/client";
import { cardDoc } from "@/lib/firebase/collections";
import { rewardLevels } from "@/lib/rewards";
import { STAMP_CELL, STAMP_GRID } from "@/lib/stamp-layout";
import type { Business, Card } from "@/lib/firebase/types";

type Notice = { kind: "ok" | "error"; text: string };

/** Lo que ve el comercio después de escanear el QR de un cliente: sumar sellos y validar canjes. */
export function StampScreen({ business, uid, onDone }: { business: Business; uid: string; onDone: () => void }) {
  const [card, setCard] = useState<Card | null | undefined>(undefined); // undefined = cargando
  const [amount, setAmount] = useState(1);
  const [busy, setBusy] = useState<"stamp" | "redeem" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const required = business.stampsRequired;
  const levels = rewardLevels(business);
  const historyRef = () => doc(collection(db, "businesses", business.slug, "history"));

  // En vivo: el sello sumado aparece al instante y también lo ve el cliente en su celular
  useEffect(
    () => onSnapshot(cardDoc(business.slug, uid), (s) => setCard(s.exists() ? s.data() : null), () => setCard(null)),
    [business.slug, uid]
  );

  async function stamp() {
    const staff = auth.currentUser;
    if (!staff || busy) return;
    setBusy("stamp");
    setNotice(null);
    try {
      const batch = writeBatch(db);
      batch.update(cardDoc(business.slug, uid), { stamps: increment(amount), totalStamps: increment(amount), lastStampAt: serverTimestamp() });
      batch.set(historyRef(), { type: "stamp", cardId: uid, amount, createdBy: staff.uid, createdAt: serverTimestamp() });
      await batch.commit();
      setNotice({ kind: "ok", text: `Listo: +${amount} ${amount === 1 ? "sello" : "sellos"}` });
    } catch {
      setNotice({ kind: "error", text: "No se pudo sumar el sello. Revisá tu conexión y que hayas ingresado con la cuenta de este negocio." });
    } finally {
      setBusy(null);
    }
  }

  async function redeem() {
    const staff = auth.currentUser;
    if (!staff || busy) return;
    setBusy("redeem");
    setNotice(null);
    try {
      const ref = cardDoc(business.slug, uid);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref); // se relee: si otro empleado ya lo canjeó, no se descuenta dos veces
        const current = snap.data();
        if (!current || current.stamps < required) throw new Error("not-enough");
        tx.update(ref, { stamps: current.stamps - required, redeemedCount: current.redeemedCount + 1 });
        tx.set(historyRef(), { type: "redeem", cardId: uid, amount: required, createdBy: staff.uid, createdAt: serverTimestamp() });
      });
      setNotice({ kind: "ok", text: `Canje validado: ${business.reward}` });
    } catch (e) {
      const notEnough = e instanceof Error && e.message === "not-enough";
      setNotice({ kind: "error", text: notEnough ? "Este cliente todavía no tiene los sellos necesarios." : "No se pudo validar el canje. Intentá de nuevo." });
    } finally {
      setBusy(null);
    }
  }

  const back = (
    <button type="button" onClick={onDone} className="flex min-h-10 items-center gap-2 text-sm font-bold text-texto"><ArrowLeft className="size-4" /> Escanear otro</button>
  );

  if (card === undefined) {
    return <div className="space-y-4">{back}<div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-texto-sec" /></div></div>;
  }
  if (card === null) {
    return (
      <div className="space-y-4">
        {back}
        <p className="rounded-3xl bg-panel p-6 text-center text-sm text-texto-sec ring-1 ring-borde">Este cliente todavía no tiene una tarjeta en {business.name}. Tiene que abrir el link de tu local y crearla.</p>
      </div>
    );
  }

  const name = card.customerName || "Cliente";
  const filled = Math.min(card.stamps, required);
  const ready = card.stamps >= required;
  const target = ready ? levels[levels.length - 1] : levels.find((l) => l.at > card.stamps) ?? levels[levels.length - 1];
  const missing = target.at - card.stamps;
  const rewardAt = levels.map((l) => l.at);
  const since = card.createdAt?.toDate?.().toLocaleDateString("es-AR", { month: "short", year: "numeric" });

  return (
    <div className="space-y-4">
      {back}
      <section className="space-y-4 rounded-3xl bg-panel p-4 ring-1 ring-borde">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-boton font-extrabold text-white">{name[0].toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate font-extrabold text-texto">{name} <BadgeCheck className="size-4" /></p>
            <p className="text-xs text-texto-sec">{since ? `Cliente desde ${since} · ` : ""}{card.totalStamps} {card.totalStamps === 1 ? "sello" : "sellos"} en total</p>
          </div>
          <span className="rounded-full border border-borde bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-texto uppercase">Detectado</span>
        </div>

        <div className="rounded-2xl border border-borde bg-white p-3">
          <div className="mb-2 flex justify-between text-sm font-bold text-texto"><span>Sellos</span><span className="tabular-nums">{filled} / {required}</span></div>
          <div className={STAMP_GRID}>
            {Array.from({ length: required }, (_, i) => (
              <span key={i} className={`${STAMP_CELL} grid h-8 place-items-center rounded-md text-xs font-bold ${i < filled ? "bg-boton text-white" : "bg-panel text-texto-sec"}`}>
                {rewardAt.includes(i + 1) ? <Gift className="size-4" /> : i < filled ? "✓" : i + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-texto-sec">Sellos a sumar:</span>
          <div className="flex gap-1 rounded-full border border-borde bg-white p-1">
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" onClick={() => setAmount(n)} aria-pressed={amount === n} className={`min-h-8 rounded-full px-3 font-bold transition-colors ${amount === n ? "bg-boton text-white" : "text-texto-sec"}`}>+{n}</button>
            ))}
          </div>
        </div>

        <button type="button" onClick={stamp} disabled={busy !== null} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-boton text-base font-bold text-white shadow-lg shadow-black/25 transition-transform active:scale-[0.98] disabled:opacity-60">
          {busy === "stamp" ? <Loader2 className="size-5 animate-spin" /> : <PlusCircle className="size-5" />} Estampar +{amount} {amount === 1 ? "sello" : "sellos"}
        </button>

        {notice && (
          <p role={notice.kind === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${notice.kind === "ok" ? "border-exito/20 bg-exito-suave text-exito" : "border-error/20 bg-error-suave text-error"}`}>
            {notice.kind === "ok" ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" />}{notice.text}
          </p>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-borde bg-white p-3">
          <Gift className="size-5 text-texto" />
          <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-sm font-bold text-texto">{target.name}</p><p className="text-xs text-texto-sec">{ready ? "Listo para canjear" : `Meta a ${missing} ${missing === 1 ? "sello" : "sellos"}`}</p></div>
          <button type="button" onClick={redeem} disabled={!ready || busy !== null} className="min-h-10 rounded-xl bg-boton px-3 text-xs font-bold text-white disabled:bg-panel disabled:text-texto-sec">{busy === "redeem" ? "Validando…" : "Validar canje"}</button>
        </div>
      </section>
    </div>
  );
}
