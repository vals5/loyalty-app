import {
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./client";
import { businessDoc, businessesCol } from "./collections";
import type { Business } from "./types";

export type NewBusinessInput = Pick<
  Business,
  "slug" | "name" | "primaryColor" | "stampsRequired" | "reward"
>;

/** El slug es el ID del documento; la lectura de /businesses es pública. */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const snap = await getDoc(businessDoc(slug));
  return !snap.exists();
}

/**
 * Crea businesses/{slug}. Las reglas exigen: usuario no anónimo,
 * ownerUid == auth.uid y slug == ID del documento. Si el slug ya es de otro
 * dueño, el setDoc se convierte en update y las reglas lo rechazan.
 */
export async function createBusiness(
  ownerUid: string,
  input: NewBusinessInput
): Promise<void> {
  const now = serverTimestamp();
  await setDoc(doc(db, "businesses", input.slug), {
    ...input,
    ownerUid,
    logoUrl: null,
    extraRewards: [],
    description: null,
    address: null,
    hours: null,
    phone: null,
    stampIcon: null,
    createdAt: now,
    updatedAt: now,
  } satisfies Record<keyof Business, unknown>);
}

export async function getBusinessByOwner(
  ownerUid: string
): Promise<Business | null> {
  const snap = await getDocs(
    query(businessesCol(), where("ownerUid", "==", ownerUid), limit(1))
  );
  return snap.empty ? null : snap.docs[0].data();
}

export type BusinessEdit = Pick<
  Business,
  "name" | "primaryColor" | "stampsRequired" | "reward" | "extraRewards" | "description" | "address" | "hours" | "phone" | "stampIcon"
>;

/** Solo el dueño puede editar (las reglas lo exigen). */
export async function updateBusiness(slug: string, data: BusinessEdit): Promise<void> {
  await updateDoc(businessDoc(slug), { ...data, updatedAt: serverTimestamp() });
}
