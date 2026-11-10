"use client";
import { useEffect, useState } from "react";
import { limit, onSnapshot, query, where } from "firebase/firestore";
import { businessesCol } from "./collections";
import { useAuthUser } from "./use-auth";
import type { Business } from "./types";

export type OwnerStatus = "loading" | "guest" | "none" | "ready";

export function useOwnerBusiness(): { status: OwnerStatus; business: Business | null } {
  const user = useAuthUser();
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const staff = !!user && !user.isAnonymous;

  // onSnapshot muestra primero lo guardado en el dispositivo y después lo actualiza desde el servidor
  useEffect(() => {
    if (!user || !staff) return undefined;
    return onSnapshot(
      query(businessesCol(), where("ownerUid", "==", user.uid), limit(1)),
      (snap) => setBusiness(snap.empty ? null : snap.docs[0].data()),
      () => setBusiness(null)
    );
  }, [user, staff]);

  const status: OwnerStatus =
    user === undefined ? "loading" : !staff ? "guest" : business === undefined ? "loading" : business === null ? "none" : "ready";
  return { status, business: business ?? null };
}
