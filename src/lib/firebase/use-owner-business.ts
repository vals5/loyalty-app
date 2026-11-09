"use client";
import { useEffect, useState } from "react";
import { getBusinessByOwner } from "./businesses";
import { useAuthUser } from "./use-auth";
import type { Business } from "./types";

export type OwnerStatus = "loading" | "guest" | "none" | "ready";

export function useOwnerBusiness(): { status: OwnerStatus; business: Business | null } {
  const user = useAuthUser();
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const staff = !!user && !user.isAnonymous;

  useEffect(() => {
    if (!user || !staff) return undefined;
    let cancelled = false;
    getBusinessByOwner(user.uid)
      .then((b) => { if (!cancelled) setBusiness(b); })
      .catch(() => { if (!cancelled) setBusiness(null); });
    return () => { cancelled = true; };
  }, [user, staff]);

  const status: OwnerStatus =
    user === undefined ? "loading" : !staff ? "guest" : business === undefined ? "loading" : business === null ? "none" : "ready";
  return { status, business: business ?? null };
}
