"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Lock, Mail } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/firebase/auth-errors";
import { AuthShell, Field, FormMessage, PrimaryButton } from "@/components/auth/auth-ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // "Recordarme": sesión persistente o solo hasta cerrar la pestaña
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      backHref="/"
      title="Iniciar sesión"
      subtitle="Ingresá tu email y contraseña para acceder a tu cuenta y gestionar tu comercio."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Correo electrónico" icon={Mail} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Contraseña" icon={Lock} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="flex items-center justify-between text-sm">
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-texto-sec">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-boton" />
            Recordarme
          </label>
          <Link href="/forgot-password" className="font-bold text-texto">¿Olvidaste tu contraseña?</Link>
        </div>

        {error && <FormMessage kind="error">{error}</FormMessage>}
        <PrimaryButton type="submit" loading={loading}>Ingresar</PrimaryButton>
      </form>

      <p className="mt-auto pt-8 text-center text-sm text-texto-sec">
        ¿No tenés cuenta? <Link href="/register" className="font-bold text-texto">Registrate acá</Link>
      </p>
    </AuthShell>
  );
}
