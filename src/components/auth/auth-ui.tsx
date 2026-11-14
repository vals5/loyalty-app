"use client";
import Link from "next/link";
import { useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";

/** Hoja redondeada sobre el fondo de color. Sirve para inicio, login, registro y recuperar contraseña. */
export function AuthShell({
  title, subtitle, logo, backHref, onBack, children,
}: { title: string; subtitle?: string; logo?: ReactNode; backHref?: string; onBack?: () => void; children: ReactNode }) {
  const backClass = "grid size-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-borde transition-transform active:scale-90";
  return (
    <main className="fondo-total min-h-dvh bg-fondo p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex sm:items-center sm:justify-center sm:p-8">
      {/* Celular: la hoja ocupa toda la pantalla. Tablet y PC: tarjeta centrada con su propio alto. */}
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col rounded-[2rem] bg-hoja px-5 pt-5 pb-8 shadow-2xl shadow-black/20 sm:min-h-0 sm:max-w-120 sm:rounded-[2.5rem] sm:px-10 sm:pt-6 sm:pb-10">
        {backHref ? (
          <Link href={backHref} aria-label="Volver" className={backClass}><ArrowLeft className="size-5 text-texto" /></Link>
        ) : onBack ? (
          <button type="button" onClick={onBack} aria-label="Volver" className={backClass}><ArrowLeft className="size-5 text-texto" /></button>
        ) : (
          <div className="h-10" />
        )}
        <header className="mt-4 text-center">
          {logo ? (
            <>
              {logo}
              <h1 className="sr-only">{title}</h1>
            </>
          ) : (
            <h1 className="text-3xl font-extrabold text-texto sm:text-4xl">{title}</h1>
          )}
          {subtitle && <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-texto-sec sm:max-w-sm sm:text-base">{subtitle}</p>}
        </header>
        <div className="mt-8 flex flex-1 flex-col">{children}</div>
      </div>
    </main>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; icon: LucideIcon; startText?: string };

/** Input con ícono, mini borde y (si es contraseña) botón para mostrar/ocultar. */
export function Field({ label, icon: Icon, startText, type = "text", ...rest }: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-borde bg-campo px-4 shadow-sm transition-colors focus-within:border-boton focus-within:ring-2 focus-within:ring-boton/15">
        <Icon className="size-5 shrink-0 text-texto-sec" aria-hidden />
        {startText && <span className="-mr-2 text-base text-texto-sec">{startText}</span>}
        <input
          id={id} type={isPassword && show ? "text" : type} placeholder={label}
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-texto outline-none placeholder:text-texto-sec"
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} className="grid size-8 place-items-center text-texto-sec">
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function PrimaryButton({ loading, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest} disabled={loading || rest.disabled}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-boton text-base font-bold text-white shadow-lg shadow-black/25 transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {children}
    </button>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="grid min-h-14 w-full place-items-center rounded-2xl bg-boton text-base font-bold text-white shadow-lg shadow-black/25 transition-transform active:scale-[0.98]">
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="grid min-h-14 w-full place-items-center rounded-2xl border border-borde bg-campo text-base font-bold text-texto shadow-sm transition-transform active:scale-[0.98]">
      {children}
    </Link>
  );
}

export function FormMessage({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-3 py-2.5 text-sm ${kind === "error" ? "border-error/20 bg-error-suave text-error" : "border-exito/20 bg-exito-suave text-exito"}`}>
      {children}
    </p>
  );
}
