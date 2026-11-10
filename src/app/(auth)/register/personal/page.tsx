"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  updateProfile,
} from "firebase/auth";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/firebase/auth-errors";
import { AuthShell, Field, FormMessage, PrimaryButton } from "@/components/auth/auth-ui";

export default function RegisterPersonalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await auth.authStateReady();
      const current = auth.currentUser;
      // Si ya usaba la app como cliente anónimo, esa sesión se convierte en cuenta:
      // conserva el mismo uid y, con él, sus tarjetas y sellos.
      const user = current?.isAnonymous
        ? (await linkWithCredential(current, EmailAuthProvider.credential(email.trim(), password))).user
        : (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;
      if (name.trim()) await updateProfile(user, { displayName: name.trim() }).catch(() => {});
      router.replace("/tarjetas");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      backHref="/"
      title="Cuenta personal"
      subtitle="Con tu cuenta no perdés tus sellos aunque cambies de celular."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Tu nombre" icon={UserIcon} required maxLength={60} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Correo electrónico" icon={Mail} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Contraseña (mínimo 8 caracteres)" icon={Lock} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirmar contraseña" icon={Lock} type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        {error && <FormMessage kind="error">{error}</FormMessage>}
        <PrimaryButton type="submit" loading={loading}>Crear cuenta</PrimaryButton>
      </form>

      <p className="mt-auto pt-8 text-center text-sm text-texto-sec">
        ¿Ya tenés cuenta? <Link href="/" className="font-bold text-texto">Ingresá acá</Link>
      </p>
    </AuthShell>
  );
}
