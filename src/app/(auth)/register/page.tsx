"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, deleteUser, type UserCredential } from "firebase/auth";
import { Gift, Hash, Link2, Lock, Mail, Palette, Store } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { createBusiness, isSlugAvailable } from "@/lib/firebase/businesses";
import { authErrorMessage } from "@/lib/firebase/auth-errors";
import { isValidSlug, slugify } from "@/lib/utils";
import { AuthShell, Field, FormMessage, PrimaryButton } from "@/components/auth/auth-ui";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#131515");
  const [stampsRequired, setStampsRequired] = useState(8);
  const [reward, setReward] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value).slice(0, 40));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Paso 1: validar el enlace y seguir
    if (step === 1) {
      if (!isValidSlug(slug)) {
        setError("El enlace debe tener 3–40 caracteres (a-z, 0-9 y guiones) y no ser una palabra reservada.");
        return;
      }
      setStep(2);
      return;
    }

    // Paso 2: crear cuenta + comercio
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    let cred: UserCredential | null = null;
    try {
      if (!(await isSlugAvailable(slug))) {
        setError("Ese enlace ya está en uso, probá con otro.");
        setStep(1);
        return;
      }
      cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await createBusiness(cred.user.uid, {
        slug,
        name: name.trim(),
        primaryColor,
        stampsRequired,
        reward: reward.trim(),
      });
      router.replace("/dashboard");
    } catch (err) {
      if (cred) await deleteUser(cred.user).catch(() => {});
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      {...(step === 1 ? { backHref: "/" } : { onBack: () => { setError(null); setStep(1); } })}
      title={step === 1 ? "Registrá tu comercio" : "Crear cuenta"}
      subtitle={step === 1 ? "Contanos cómo se llama tu local y qué premio vas a dar a tus clientes." : "Con estos datos vas a ingresar a tu panel."}
    >
      <p className="mb-4 text-center text-xs font-bold text-texto-sec">Paso {step} de 2</p>

      <form onSubmit={onSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <Field label="Nombre del comercio" icon={Store} required minLength={2} maxLength={80} value={name} onChange={(e) => onNameChange(e.target.value)} />
            <Field
              label="Enlace de tu tarjeta" icon={Link2} startText="/c/" placeholder="cafeteria-don-pepe" required
              value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value).slice(0, 40)); }}
            />
            <Field label="Premio (ej: Café gratis)" icon={Gift} required minLength={2} maxLength={120} value={reward} onChange={(e) => setReward(e.target.value)} />
            <div className="grid gap-3 min-[380px]:grid-cols-2">
              <Field label="Sellos" icon={Hash} type="number" required min={2} max={20} value={stampsRequired} onChange={(e) => setStampsRequired(Number(e.target.value))} />
              <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-borde bg-campo px-4 shadow-sm">
                <Palette className="size-5 shrink-0 text-texto-sec" aria-hidden />
                <span className="flex-1 text-base text-texto-sec">Color</span>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())} className="size-8 cursor-pointer rounded-full border border-borde bg-transparent p-0" />
              </label>
            </div>
          </>
        ) : (
          <>
            <Field label="Correo electrónico" icon={Mail} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field label="Contraseña (mínimo 8 caracteres)" icon={Lock} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Field label="Confirmar contraseña" icon={Lock} type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </>
        )}

        {error && <FormMessage kind="error">{error}</FormMessage>}
        <PrimaryButton type="submit" loading={loading}>{step === 1 ? "Continuar" : "Crear cuenta"}</PrimaryButton>
      </form>

      <p className="mt-auto pt-8 text-center text-sm text-texto-sec">
        ¿Ya tenés cuenta? <Link href="/login" className="font-bold text-texto">Ingresá acá</Link>
      </p>
    </AuthShell>
  );
}
