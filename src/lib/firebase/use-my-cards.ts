"use client";
import { useEffect, useMemo, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { getSavedSlugs } from "@/lib/my-cards";
import { businessDoc, cardDoc } from "./collections";
import { syncCardIndex, userCardsCol } from "./user-cards";
import { useAuthUser } from "./use-auth";
import type { Business, Card } from "./types";

export type MyCard = { slug: string; business: Business; card: Card };
type Entry = { business?: Business | null; card?: Card | null };

const recency = (c: MyCard) => c.card.lastStampAt?.toMillis?.() ?? c.card.createdAt?.toMillis?.() ?? 0;

/** Tarjetas de la cuenta (en cualquier dispositivo) más las de este dispositivo, en vivo. La más reciente va primero. */
export function useMyCards(): { loading: boolean; cards: MyCard[] } {
  const user = useAuthUser();
  const uid = user?.uid;
  const [local, setLocal] = useState<string[] | null>(null);
  const [remote, setRemote] = useState<string[] | null>(null);
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  useEffect(() => {
    setLocal(getSavedSlugs());
  }, []);

  // Índice en la nube. Si falla (reglas sin publicar, sin conexión), se usa solo la lista del dispositivo.
  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      userCardsCol(uid),
      (snap) => setRemote(snap.docs.map((d) => d.id)),
      () => setRemote([])
    );
  }, [uid]);

  const slugs = useMemo(() => {
    if (!local) return null;
    if (!uid) return local;
    return remote ? [...new Set([...remote, ...local])] : null;
  }, [local, remote, uid]);

  useEffect(() => {
    if (!uid || !slugs) return undefined;
    let cancelled = false;
    const patch = (slug: string, p: Entry) => {
      if (!cancelled) setEntries((prev) => ({ ...prev, [slug]: { ...prev[slug], ...p } }));
    };
    // onSnapshot entrega primero lo que hay en caché y después lo actualiza desde el servidor
    const unsubs = slugs.flatMap((slug) => [
      onSnapshot(businessDoc(slug), (s) => patch(slug, { business: s.exists() ? s.data() : null }), () => patch(slug, { business: null })),
      onSnapshot(cardDoc(slug, uid), (s) => patch(slug, { card: s.exists() ? s.data() : null }), () => patch(slug, { card: null })),
    ]);
    return () => { cancelled = true; unsubs.forEach((u) => u()); };
  }, [uid, slugs]);

  // Tarjetas que este dispositivo conoce y la cuenta todavía no: se suben para verlas en otros dispositivos
  useEffect(() => {
    if (!uid || !local || !remote) return;
    local.filter((s) => !remote.includes(s) && entries[s]?.card).forEach((s) => syncCardIndex(uid, s));
  }, [uid, local, remote, entries]);

  const loading =
    user === undefined || slugs === null ||
    (!!uid && slugs.some((s) => entries[s]?.business === undefined || entries[s]?.card === undefined));

  const cards = (slugs ?? [])
    .flatMap((slug) => { const e = entries[slug]; return e?.business && e?.card ? [{ slug, business: e.business, card: e.card }] : []; })
    .sort((a, b) => recency(b) - recency(a));

  return { loading, cards };
}
