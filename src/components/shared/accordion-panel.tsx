"use client";
import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

/** Panel desplegable: cerrado muestra un resumen, abierto muestra las opciones. */
export function AccordionPanel({
  id, icon: Icon, title, subtitle, summary, open, onToggle, children,
}: {
  id: string; icon?: LucideIcon; title: string; subtitle?: string; summary?: ReactNode;
  open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-panel ring-1 ring-borde">
      <h3>
        <button type="button" id={`${id}-btn`} aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-3xl p-4 text-left transition-colors active:bg-black/5">
          {Icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-borde"><Icon className="size-4 text-texto" /></span>}
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-texto">{title}</span>
            <span className="block truncate text-xs text-texto-sec">{!open && summary ? summary : subtitle}</span>
          </span>
          <ChevronDown className={`size-5 shrink-0 text-texto-sec transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </h3>
      <div id={`${id}-body`} role="region" aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4" inert={!open}>{children}</div>
        </div>
      </div>
    </section>
  );
}
