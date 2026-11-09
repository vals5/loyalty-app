import type { CSSProperties } from "react";
import { Gift, Star } from "lucide-react";
import { onBrand } from "@/lib/color";
import { stampType } from "@/lib/stamp-types";
import { STAMP_CELL, STAMP_GRID } from "@/lib/stamp-layout";

type Props = {
  name: string;
  color: string;
  reward: string;
  required: number; // sellos para el premio (el último casillero es el premio)
  filled: number;
  typeKey?: string | null; // ícono del sello
  rewardAt?: number[]; // nº de sello de cada recompensa (si falta: solo el último)
  variant?: "grande" | "compacta";
  actionLabel?: string; // texto del botón (decorativo: la tarjeta entera suele ir dentro de un <Link>)
  headline?: { eyebrow: string; title: string }; // cabecera alternativa (pantalla de detalle)
  progress?: boolean; // en vez de "próxima recompensa", barra de progreso
};

const soft = "bg-[color-mix(in_oklab,var(--on)_14%,transparent)]";

export function WalletCard({ name, color, reward, required, filled, typeKey, rewardAt, variant = "grande", actionLabel, headline, progress }: Props) {
  const type = stampType(typeKey);
  const shown = Math.min(filled, required);
  const done = filled >= required;
  const pct = Math.round((shown / required) * 100);
  const style = { "--card": color, "--on": onBrand(color) } as CSSProperties;
  const cells = Array.from({ length: required }, (_, i) => ({ i, isReward: rewardAt ? rewardAt.includes(i + 1) : i === required - 1, on: i < filled }));

  if (variant === "compacta") {
    return (
      <article style={style} className="rounded-3xl bg-panel p-4 ring-1 ring-borde">
        <header className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-borde"><type.icon className="size-5 text-texto" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-extrabold text-texto">{name}</h2>
            <p className="truncate text-xs text-texto-sec">{type.label}</p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-texto tabular-nums ring-1 ring-borde">{shown} / {required} sellos</span>
        </header>

        {required <= 6 ? (
          <ol className="mt-3 flex gap-2 rounded-2xl bg-white p-2 ring-1 ring-borde" aria-label={`${shown} de ${required} sellos`}>
            {cells.map(({ i, isReward, on }) => (
              <li key={i} className={`grid h-9 flex-1 place-items-center rounded-lg text-xs font-bold ${on || (isReward && done) ? "bg-(--card) text-(--on)" : "bg-panel text-texto-sec"}`}>
                {isReward ? <Gift className="size-4" /> : on ? <type.icon className="size-4" /> : i + 1}
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-borde" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-(--card) transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        )}

        <footer className="mt-3 flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-texto"><Star className="size-3.5 shrink-0" /><span className="truncate">{reward}</span></p>
          {actionLabel && <span className="shrink-0 rounded-full bg-boton px-4 py-2 text-xs font-bold text-white">{actionLabel}</span>}
        </footer>
      </article>
    );
  }

  return (
    <article style={style} className="rounded-3xl bg-(--card) p-4 text-(--on) shadow-lg shadow-black/15">
      <header className="flex items-center gap-3">
        {headline ? (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-60">{headline.eyebrow}</p>
            <h2 className="truncate text-xl font-extrabold">{headline.title}</h2>
          </div>
        ) : (
          <>
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${soft}`}><type.icon className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-extrabold">{name}</h2>
              <p className="truncate text-[11px] font-medium tracking-wide uppercase opacity-60">{type.label} • {required} sellos</p>
            </div>
          </>
        )}
        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${soft}`}><Star className="size-3 fill-current" /> {shown} / {required}</span>
      </header>

      <ol className={`mt-4 ${STAMP_GRID} rounded-2xl bg-black/25 p-2.5`} aria-label={`${shown} de ${required} sellos`}>
        {cells.map(({ i, isReward, on }) => {
          const lit = on || (isReward && done);
          return (
            <li
              key={i}
              className={`${STAMP_CELL} grid aspect-square place-items-center rounded-xl text-sm font-bold ${lit ? "bg-(--on) text-(--card)" : `${soft} opacity-80`} ${on && i === filled - 1 && !done ? "animate-pop" : ""} ${i === required - 1 && done ? "animate-pop" : ""}`}
            >
              {isReward ? <Gift className="size-5" /> : on ? <type.icon className="size-5" /> : i + 1}
            </li>
          );
        })}
      </ol>

      {progress ? (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold"><span>{shown} de {required} sellos acumulados</span><span>{pct}%</span></div>
          <div className={`h-1.5 overflow-hidden rounded-full ${soft}`}><div className="h-full rounded-full bg-(--on) transition-all duration-700" style={{ width: `${pct}%` }} /></div>
        </div>
      ) : (
        <footer className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-60">Próxima recompensa</p>
            <p className="truncate font-bold">{reward}</p>
          </div>
          {actionLabel && <span className="shrink-0 rounded-full bg-(--on) px-4 py-2.5 text-xs font-bold text-(--card)">{actionLabel}</span>}
        </footer>
      )}
    </article>
  );
}
