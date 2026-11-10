import { collection, doc, setDoc, type CollectionReference } from "firebase/firestore";
import { db } from "./client";

/**
 * users/{uid}/cards/{slug}: qué comercios tiene esta cuenta. Es lo que permite ver "Mis tarjetas"
 * en otro dispositivo (antes la lista solo existía en el navegador).
 */
export const userCardsCol = (uid: string) =>
  collection(db, "users", uid, "cards") as CollectionReference<{ slug: string }>;

const KEY = "card-index-synced";
const inflight = new Set<string>();

function readSynced(): Set<string> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
  } catch {
    return new Set();
  }
}

/** Registra la tarjeta en la nube una sola vez por cuenta y comercio. Nunca bloquea ni rompe la pantalla. */
export function syncCardIndex(uid: string, slug: string): void {
  const id = `${uid}/${slug}`;
  if (inflight.has(id) || readSynced().has(id)) return;
  inflight.add(id);
  setDoc(doc(db, "users", uid, "cards", slug), { slug })
    .then(() => {
      try {
        const done = readSynced();
        done.add(id);
        localStorage.setItem(KEY, JSON.stringify([...done]));
      } catch { /* sin storage: se reintenta en la próxima visita */ }
    })
    .catch(() => { /* reglas sin publicar u offline: se reintenta más adelante */ })
    .finally(() => inflight.delete(id));
}
