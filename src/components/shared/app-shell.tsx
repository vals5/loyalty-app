"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, QrCode, Store, UserRound, Wallet, type LucideIcon } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "./brand-logo";
import { Sheet } from "./sheet";

type Tab = { href: string; label: string; icon: LucideIcon };

const LEFT: Tab[] = [
  { href: "/tarjetas", label: "Mis tarjetas", icon: Wallet },
  { href: "/recompensas", label: "Recompensas", icon: Gift },
];
const RIGHT: Tab[] = [
  { href: "/dashboard", label: "Mi negocio", icon: Store },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const business = pathname.startsWith("/dashboard");
  const scanning = pathname.startsWith("/scan");

  const tab = ({ href, label, icon: Icon }: Tab) => {
    const active = pathname.startsWith(href);
    return (
      <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${active ? "text-texto" : "text-texto-sec/70"}`}>
        <Icon className={`size-5 transition-transform ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  const nav = (
    <nav className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 grid grid-cols-5 rounded-b-[2rem] border-t border-borde bg-hoja/95 backdrop-blur sm:rounded-b-[2.5rem]">
      {LEFT.map(tab)}
      {/* Botón central: escanear un QR (nueva tarjeta o sumar sellos) */}
      <div className="grid place-items-center">
        <Link href="/scan" aria-label="Escanear QR" aria-current={scanning ? "page" : undefined}
          className={`grid size-14 -translate-y-5 place-items-center rounded-full bg-boton text-white shadow-lg shadow-black/30 ring-4 ring-hoja transition-transform active:scale-90 ${scanning ? "scale-105" : ""}`}>
          <QrCode className="size-7" strokeWidth={2.25} />
        </Link>
      </div>
      {RIGHT.map(tab)}
    </nav>
  );

  return (
    <Sheet nav={nav}>
      <div className="mb-5 flex items-center gap-2.5">
        <BrandMark className="size-9 shrink-0" />
        <span className="text-xs font-extrabold tracking-widest text-texto">{business ? `${BRAND.name} NEGOCIOS`.toUpperCase() : BRAND.name.toUpperCase()}</span>
      </div>
      {children}
    </Sheet>
  );
}
