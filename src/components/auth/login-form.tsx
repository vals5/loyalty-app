"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { getBusinessByOwner } from "@/lib/firebase/businesses";
import { authErrorMessage } from "@/lib/firebase/auth-errors";
import { Field, FormMessage, PrimaryButton } from "@/components/auth/auth-ui";

/** Email + contraseña. Si la cuenta tiene un negocio va al panel; si es personal, a sus tarjetas. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Precarga los destinos para que, al ingresar, el cambio de pantalla sea inmediato
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/tarjetas");
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // "Recordarme": sesión persistente o solo hasta cerrar la pestaña
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const business = await getBusinessByOwner(cred.user.uid).catch(() => null);
      router.replace(business ? "/dashboard" : "/tarjetas");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
