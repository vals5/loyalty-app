"use client";
import { useEffect, useState } from "react";
import { getDoc, onSnapshot } from "firebase/firestore";
import { getSavedSlugs } from "@/lib/my-cards";
import { businessDoc, cardDoc } from "./collections";
import { useAuthUser } from "./use-auth";
import type { Business, Card } from "./types";

export type MyCard = { slug: string; business: Business; card: Card };
type Entry = { business?: Business | null; card?: Card | null };

const recency = (c: MyCard) => c.card.lastStampAt?.toMillis?.() ?? c.card.createdAt?.toMillis?.() ?? 0;

/** Tarjetas de este dispositivo, en vivo. La más reciente va primero. */
export function useMyCards(): { loading: boolean; cards: MyCard[] } {
  const user = useAuthUser();
  const uid = user?.uid;
  const [slugs, setSlugs] = useState<string[] | null>(null);
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  useEffect(() => {
    setSlugs(getSavedSlugs());
  }, []);

  useEffect(() => {
    if (!uid || !slugs) return undefined;
    let cancelled = false;
    const patch = (slug: string, p: Entry) => {
      if (!cancelled) setEntries((prev) => ({ ...prev, [slug]: { ...prev[slug], ...p } }));
    };
    const unsubs = slugs.map((slug) => {
      getDoc(businessDoc(slug)).then((s) => patch(slug, { business: s.exists() ? s.data() : null })).catch(() => patch(slug, { business: null }));
      return onSnapshot(cardDoc(slug, uid), (s) => patch(slug, { card: s.exists() ? s.data() : null }), () => patch(slug, { card: null }));
    });
    return () => { cancelled = true; unsubs.forEach((u) => u()); };
  }, [uid, slugs]);

  const loading =
    user === undefined || slugs === null ||
    (!!uid && slugs.some((s) => entries[s]?.business === undefined || entries[s]?.card === undefined));

  const cards = (slugs ?? [])
    .flatMap((slug) => { const e = entries[slug]; return e?.business && e?.card ? [{ slug, business: e.business, card: e.card }] : []; })
    .sort((a, b) => recency(b) - recency(a));

  return { loading, cards };
}
