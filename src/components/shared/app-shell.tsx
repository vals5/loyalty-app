"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, ScanLine, Store, Wallet } from "lucide-react";
import { Sheet } from "./sheet";

const TABS = [
  { href: "/tarjetas", label: "Mis tarjetas", icon: Wallet },
  { href: "/recompensas", label: "Recompensas", icon: Gift },
  { href: "/dashboard", label: "Mi negocio", icon: Store },
  { href: "/scan", label: "Escanear", icon: ScanLine },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const business = pathname.startsWith("/dashboard") || pathname.startsWith("/scan");

  const nav = (
    <nav className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 grid grid-cols-4 rounded-b-[2rem] border-t border-borde bg-hoja/95 backdrop-blur sm:rounded-b-[2.5rem]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${active ? "text-texto" : "text-texto-sec/70"}`}>
            <Icon className={`size-5 transition-transform ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <Sheet nav={nav}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-boton text-white"><Wallet className="size-4" /></span>
        <span className="text-xs font-extrabold tracking-widest text-texto">{business ? "FIDELIDAD NEGOCIOS" : "FIDELIDAD"}</span>
      </div>
      {children}
    </Sheet>
  );
}
