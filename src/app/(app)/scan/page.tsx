"use client";
import { useState } from "react";
import { BadgeCheck, Flashlight, Gift, Keyboard, PlusCircle } from "lucide-react";

// TODO: conectar la cámara (p. ej. @yudiel/react-qr-scanner) dentro de #visor,
// usar parseQrPayload(raw) y, al confirmar, sumar sellos + escribir en historyCol.
const DEMO = { name: "Carlos Mendoza", tier: "Cliente frecuente · Visita #14", stamps: 6, required: 8, reward: "Combo doble gratis" };

export default function ScanPage() {
  const [amount, setAmount] = useState(1);
  const canRedeem = DEMO.stamps >= DEMO.required;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold text-texto">Escanear</h1>

      <section id="visor" className="relative h-72 overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-boton">
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative size-44">
            {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((c) => (
              <span key={c} className={`absolute size-9 border-white ${c}`} />
            ))}
            <span className="absolute inset-x-2 h-0.5 animate-scan rounded-full bg-white shadow-[0_0_12px_white]" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-linear-to-t from-black/60 to-transparent p-3 text-xs font-semibold text-white">
          <button className="flex min-h-9 items-center gap-1.5"><Flashlight className="size-4" /> Linterna</button>
          <button className="flex min-h-9 items-center gap-1.5"><Keyboard className="size-4" /> Código manual</button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl bg-panel p-4 ring-1 ring-borde">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-boton font-extrabold text-white">{DEMO.name[0]}</span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate font-extrabold text-texto">{DEMO.name} <BadgeCheck className="size-4" /></p>
            <p className="text-xs text-texto-sec">{DEMO.tier}</p>
          </div>
          <span className="rounded-full border border-borde bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-texto uppercase">Detectado</span>
        </div>

        <div className="rounded-2xl border border-borde bg-white p-3">
          <div className="mb-2 flex justify-between text-sm font-bold text-texto"><span>Sellos</span><span className="tabular-nums">{DEMO.stamps} / {DEMO.required}</span></div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: DEMO.required }, (_, i) => (
              <span key={i} className={`grid h-8 place-items-center rounded-md text-xs font-bold ${i < DEMO.stamps ? "bg-boton text-white" : "bg-panel text-texto-sec"}`}>
                {i === DEMO.required - 1 ? <Gift className="size-4" /> : i < DEMO.stamps ? "✓" : i + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-texto-sec">Sellos a sumar:</span>
          <div className="flex gap-1 rounded-full border border-borde bg-white p-1">
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => setAmount(n)} aria-pressed={amount === n} className={`min-h-8 rounded-full px-3 font-bold transition-colors ${amount === n ? "bg-boton text-white" : "text-texto-sec"}`}>+{n}</button>
            ))}
          </div>
        </div>

        <button className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-boton text-base font-bold text-white shadow-lg shadow-black/25 transition-transform active:scale-[0.98]">
          <PlusCircle className="size-5" /> Estampar +{amount} {amount === 1 ? "sello" : "sellos"}
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-borde bg-white p-3">
          <Gift className="size-5 text-texto" />
          <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-sm font-bold text-texto">{DEMO.reward}</p><p className="text-xs text-texto-sec">{canRedeem ? "Listo para canjear" : `Meta a ${DEMO.required - DEMO.stamps} sellos`}</p></div>
          <button disabled={!canRedeem} className="min-h-10 rounded-xl bg-boton px-3 text-xs font-bold text-white disabled:bg-panel disabled:text-texto-sec">Validar canje</button>
        </div>
      </section>
    </div>
  );
}
