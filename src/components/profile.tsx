"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, updateProfile } from "firebase/auth";
import { ExternalLink, Loader2, LogOut, Pencil, Store, UserRound } from "lucide-react";
import { Panel, inputCls } from "@/components/shared/panel";
import { auth } from "@/lib/firebase/client";
import { useAuthUser } from "@/lib/firebase/use-auth";
import { useOwnerBusiness } from "@/lib/firebase/use-owner-business";

const linkBtn = "grid min-h-12 place-items-center rounded-2xl font-bold";

export function Profile() {
  const router = useRouter();
  const user = useAuthUser();
  const { status, business } = useOwnerBusiness();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<string | null>(null); // el objeto User no se vuelve a renderizar solo
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user === undefined) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-texto-sec" /></div>;
  }
  if (user === null) {
    return <p className="rounded-3xl bg-panel p-6 text-center text-sm text-texto-sec ring-1 ring-borde">No se pudo iniciar sesión. Revisá tu conexión y recargá.</p>;
  }

  const guest = user.isAnonymous;
  const displayName = saved ?? user.displayName ?? "";
  const title = displayName || (guest ? "Invitado" : user.email?.split("@")[0] || "Mi cuenta");
  const kind = business ? "Cuenta de negocio" : guest ? "Sin cuenta" : "Cuenta personal";

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const next = name.trim();
      await updateProfile(user, { displayName: next });
      setSaved(next);
      setEditing(false);
    } catch {
      setError("No se pudo guardar el nombre. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setLeaving(true);
    try {
      await signOut(auth);
      router.replace("/");
    } catch {
      setLeaving(false);
      setError("No se pudo cerrar la sesión. Intentá de nuevo.");
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-boton text-2xl font-extrabold text-white">{title[0].toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold text-texto">{title}</h1>
          <p className="truncate text-sm text-texto-sec">{guest ? "Usando la app sin cuenta" : user.email}</p>
          <span className="mt-1.5 inline-block rounded-full border border-borde bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-texto uppercase">{kind}</span>
        </div>
      </header>

      {guest ? (
        <Panel icon={UserRound} title="Creá tu cuenta" subtitle="Tus tarjetas hoy están solo en este dispositivo">
          <p className="mb-3 text-sm text-texto-sec">Con una cuenta no perdés tus sellos aunque cambies de celular.</p>
          <div className="grid gap-2">
            <Link href="/register/personal" className={`${linkBtn} bg-boton text-white`}>Crear cuenta personal</Link>
            <Link href="/" className={`${linkBtn} border border-borde bg-campo text-texto`}>Ya tengo cuenta</Link>
          </div>
        </Panel>
      ) : (
        <Panel icon={UserRound} title="Mi cuenta" right={!editing ? (
          <button type="button" onClick={() => { setName(displayName); setEditing(true); }} aria-label="Editar nombre" className="grid size-9 place-items-center rounded-full border border-borde bg-white text-texto"><Pencil className="size-4" /></button>
        ) : undefined}>
          {editing ? (
            <form onSubmit={saveName} className="space-y-3">
              <label htmlFor="profile-name" className="block text-sm font-semibold text-texto">Tu nombre</label>
              <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className={inputCls} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(false)} className="min-h-12 flex-1 rounded-xl border border-borde bg-campo font-bold text-texto">Cancelar</button>
                <button disabled={saving} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-boton font-bold text-white disabled:opacity-60">{saving && <Loader2 className="size-4 animate-spin" />} Guardar</button>
              </div>
            </form>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-texto-sec">Nombre</dt><dd className="truncate font-bold text-texto">{displayName || "Sin nombre"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-texto-sec">Email</dt><dd className="truncate font-bold text-texto">{user.email}</dd></div>
            </dl>
          )}
        </Panel>
      )}

      {status === "ready" && business && (
        <Panel icon={Store} title={business.name} subtitle="Tu negocio">
          <div className="grid gap-2">
            <Link href="/dashboard" className={`${linkBtn} bg-boton text-white`}>Ir a mi negocio</Link>
            <Link href={`/c/${business.slug}`} className={`${linkBtn} flex items-center justify-center gap-2 border border-borde bg-campo text-texto`}><ExternalLink className="size-4" /> Ver mi tarjeta pública</Link>
          </div>
        </Panel>
      )}

      {error && <p role="alert" className="rounded-xl border border-error/20 bg-error-suave px-3 py-2.5 text-sm text-error">{error}</p>}

      {!guest && (
        <button type="button" onClick={logout} disabled={leaving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-borde bg-campo font-bold text-texto disabled:opacity-60">
          {leaving ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />} Cerrar sesión
        </button>
      )}
    </div>
  );
}
