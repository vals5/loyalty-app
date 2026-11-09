import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export const inputCls =
  "min-h-12 w-full rounded-xl border border-borde bg-campo px-3.5 text-base text-texto outline-none transition-colors placeholder:text-texto-sec focus:border-boton focus:ring-2 focus:ring-boton/15";

export function Panel({ icon: Icon, title, subtitle, right, children }: { icon?: LucideIcon; title: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-panel p-4 ring-1 ring-borde">
      <div className="flex items-start gap-3">
        {Icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-borde"><Icon className="size-4 text-texto" /></span>}
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-texto">{title}</h3>
          {subtitle && <p className="text-xs text-texto-sec">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
