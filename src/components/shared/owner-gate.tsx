"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useOwnerBusiness } from "@/lib/firebase/use-owner-business";
import type { Business } from "@/lib/firebase/types";

/** Muestra el contenido solo si hay un dueño con negocio; si no, invita a ingresar o registrarse. */
export function OwnerGate({ children }: { children: (business: Business) => React.ReactNode }) {
  const { status, business } = useOwnerBusiness();

  if (status === "loading") {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-texto-sec" /></div>;
  }
  if (!business) {
    const guest = status === "guest";
    return (
      <section className="space-y-4 rounded-3xl bg-panel p-6 text-center ring-1 ring-borde">
        <h2 className="text-lg font-extrabold text-texto">{guest ? "Ingresá a tu negocio" : "Todavía no tenés un negocio"}</h2>
        <p className="text-sm text-texto-sec">{guest ? "Con tu cuenta podés editar la tarjeta, ver tus clientes y escanear sellos." : "Registralo para crear tu tarjeta de fidelidad."}</p>
        <div className="grid gap-2">
          <Link href={guest ? "/login" : "/register"} className="grid min-h-12 place-items-center rounded-2xl bg-boton font-bold text-white">{guest ? "Ingresar" : "Registrar negocio"}</Link>
          {guest && <Link href="/register" className="grid min-h-12 place-items-center rounded-2xl border border-borde bg-campo font-bold text-texto">Registrar negocio</Link>}
        </div>
      </section>
    );
  }
  return <>{children(business)}</>;
}
