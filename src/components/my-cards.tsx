"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Loader2, Plus, Search, Wallet } from "lucide-react";
import { WalletCard } from "@/components/card/wallet-card";
import { Panel } from "@/components/shared/panel";
import { useMyCards } from "@/lib/firebase/use-my-cards";
import { stampType } from "@/lib/stamp-types";
import { rewardLevels } from "@/lib/rewards";
import { slugify } from "@/lib/utils";

const chip = "inline-flex items-center gap-1.5 rounded-full border border-borde bg-white px-3 py-1.5 text-xs font-bold text-texto";

export function MyCards() {
  const { loading, cards } = useMyCards();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [code, setCode] = useState("");

  const firstName = cards.find((c) => c.card.customerName)?.card.customerName?.split(" ")[0];
  const ready = cards.filter((c) => c.card.stamps >= c.business.stampsRequired).length;
  const earned = cards.reduce((n, c) => n + c.card.totalStamps, 0);
  const types = [...new Set(cards.map((c) => stampType(c.business.stampIcon).key))];
  const shown = cards.filter((c) => (cat === "todos" || stampType(c.business.stampIcon).key === cat) && c.business.name.toLowerCase().includes(q.trim().toLowerCase()));

  function addCard(e: FormEvent) {
    e.preventDefault();
    const slug = slugify(code);
    if (slug) router.push(`/c/${slug}`);
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold text-texto">¡Hola{firstName ? `, ${firstName}` : ""}! 👋</h1>
        <p className="text-sm text-texto-sec">Tu tarjetero digital activo</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={chip}><Gift className="size-3.5" /> {ready} {ready === 1 ? "premio listo" : "premios listos"}</span>
          <span className={chip}>{earned} {earned === 1 ? "sello ganado" : "sellos ganados"}</span>
        </div>
      </header>

      {cards.length > 0 && (
        <>
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-borde bg-panel px-4">
            <Search className="size-5 shrink-0 text-texto-sec" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar comercios o tarjetas…" aria-label="Buscar tarjetas" className="min-w-0 flex-1 bg-transparent text-base text-texto outline-none placeholder:text-texto-sec" />
          </label>
          {types.length > 1 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {[["todos", `Todos (${cards.length})`], ...types.map((k) => [k, stampType(k).label])].map(([k, label]) => (
                <button key={k} onClick={() => setCat(k)} aria-pressed={cat === k}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${cat === k ? "bg-boton text-white" : "border border-borde bg-panel text-texto"}`}>{label}</button>
              ))}
            </div>
          )}
        </>
      )}

      {loading && <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-texto-sec" /></div>}

      {!loading && cards.length === 0 && (
        <section className="rounded-3xl bg-panel p-6 text-center ring-1 ring-borde">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-white ring-1 ring-borde"><Wallet className="size-7 text-texto" /></span>
          <h2 className="mt-3 font-extrabold text-texto">Todavía no tenés tarjetas</h2>
          <p className="mt-1 text-sm text-texto-sec">Escaneá el QR del local o ingresá su código para crear la primera.</p>
        </section>
      )}

      {shown.map((c, i) => (
        <Link key={c.slug} href={`/c/${c.slug}`} aria-label={`Abrir tarjeta de ${c.business.name}`} className="block transition-transform active:scale-[0.98]">
          <WalletCard
            name={c.business.name} color={c.business.primaryColor} reward={c.business.reward} required={c.business.stampsRequired}
            filled={c.card.stamps} typeKey={c.business.stampIcon} rewardAt={rewardLevels(c.business).map((l) => l.at)} variant={i === 0 ? "grande" : "compacta"} actionLabel={i === 0 ? "Mostrar QR" : "Ver pase"}
          />
        </Link>
      ))}
      {!loading && cards.length > 0 && shown.length === 0 && <p className="py-6 text-center text-sm text-texto-sec">No encontramos tarjetas con ese filtro.</p>}

      <Panel icon={Plus} title="Agregar una tarjeta" subtitle="El código es el nombre del local en el link (…/c/codigo).">
        <form onSubmit={addCard} className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ej: burger-artisan" aria-label="Código del local"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-borde bg-campo px-3.5 text-base text-texto outline-none placeholder:text-texto-sec focus:border-boton focus:ring-2 focus:ring-boton/15" />
          <button className="grid min-h-12 w-12 place-items-center rounded-xl bg-boton text-white active:scale-95" aria-label="Agregar"><Plus className="size-5" /></button>
        </form>
      </Panel>
    </div>
  );
}
