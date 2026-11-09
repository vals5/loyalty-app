"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/firebase/auth-errors";
import { AuthShell, Field, FormMessage, PrimaryButton } from "@/components/auth/auth-ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      backHref="/login"
      title="Recuperar contraseña"
      subtitle="Ingresá tu email y te enviamos un link para restablecer tu contraseña y volver a entrar."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Correo electrónico" icon={Mail} type="email" required autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setSent(false); }} />
        {error && <FormMessage kind="error">{error}</FormMessage>}
        {sent && <FormMessage kind="ok">Si ese email tiene una cuenta, te enviamos el link. Revisá también la carpeta de spam.</FormMessage>}
        <PrimaryButton type="submit" loading={loading}>{sent ? "Reenviar link" : "Continuar"}</PrimaryButton>
      </form>

      <Link href="/login" className="mt-auto flex items-center justify-center gap-2 pt-8 text-sm font-bold text-texto-sec">
        <ArrowLeft className="size-4" /> Volver a ingresar
      </Link>
    </AuthShell>
  );
}
