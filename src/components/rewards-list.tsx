"use client";
import Link from "next/link";
import { Gift, Loader2, Lock } from "lucide-react";
import { useMyCards, type MyCard } from "@/lib/firebase/use-my-cards";

function Row({ c }: { c: MyCard }) {
  const required = c.business.stampsRequired;
  const ready = c.card.stamps >= required;
  const pct = Math.round((Math.min(c.card.stamps, required) / required) * 100);
  return (
    <Link href={`/c/${c.slug}`} className="flex items-center gap-3 rounded-2xl bg-panel p-3.5 ring-1 ring-borde transition-transform active:scale-[0.98]">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${ready ? "bg-boton text-white" : "bg-white text-texto-sec ring-1 ring-borde"}`}>{ready ? <Gift className="size-5" /> : <Lock className="size-5" />}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-texto">{c.business.reward}</p>
        <p className="truncate text-xs text-texto-sec">{c.business.name} · {Math.min(c.card.stamps, required)} / {required} sellos</p>
        {!ready && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white ring-1 ring-borde"><div className="h-full rounded-full bg-boton" style={{ width: `${pct}%` }} /></div>}
      </div>
      {ready && <span className="shrink-0 rounded-full bg-boton px-3 py-1.5 text-[11px] font-bold text-white">¡Listo!</span>}
    </Link>
  );
}

export function RewardsList() {
  const { loading, cards } = useMyCards();
  const ready = cards.filter((c) => c.card.stamps >= c.business.stampsRequired);
  const pending = cards.filter((c) => c.card.stamps < c.business.stampsRequired).sort((a, b) => b.card.stamps / b.business.stampsRequired - a.card.stamps / a.business.stampsRequired);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-texto">Recompensas</h1>
        <p className="text-sm text-texto-sec">Tus premios en todos los locales</p>
      </header>
      {loading && <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-texto-sec" /></div>}
      {!loading && cards.length === 0 && <p className="rounded-3xl bg-panel p-6 text-center text-sm text-texto-sec ring-1 ring-borde">Cuando tengas tarjetas, acá vas a ver qué premio te falta en cada local.</p>}
      {ready.length > 0 && <section className="space-y-2"><h2 className="font-extrabold text-texto">Listos para canjear ({ready.length})</h2>{ready.map((c) => <Row key={c.slug} c={c} />)}</section>}
      {pending.length > 0 && <section className="space-y-2"><h2 className="font-extrabold text-texto">En progreso ({pending.length})</h2>{pending.map((c) => <Row key={c.slug} c={c} />)}</section>}
    </div>
  );
}
