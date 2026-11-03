import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "./client";
import type { Business, Card, HistoryEntry } from "./types";

export const businessesCol = () =>
  collection(db, "businesses") as CollectionReference<Business>;

export const businessDoc = (slug: string) =>
  doc(db, "businesses", slug) as DocumentReference<Business>;

export const cardsCol = (slug: string) =>
  collection(db, "businesses", slug, "cards") as CollectionReference<Card>;

export const cardDoc = (slug: string, customerUid: string) =>
  doc(db, "businesses", slug, "cards", customerUid) as DocumentReference<Card>;

export const historyCol = (slug: string) =>
  collection(db, "businesses", slug, "history") as CollectionReference<HistoryEntry>;

// Contenido del QR: "loyalty:<slug>:<customerUid>"
export const buildQrPayload = (slug: string, customerUid: string) =>
  `loyalty:${slug}:${customerUid}`;

export function parseQrPayload(
  raw: string
): { slug: string; customerUid: string } | null {
  const [prefix, slug, customerUid] = raw.split(":");
  if (prefix !== "loyalty" || !slug || !customerUid) return null;
  return { slug, customerUid };
}
