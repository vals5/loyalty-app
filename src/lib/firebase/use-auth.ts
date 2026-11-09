"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "./client";

/** undefined = cargando. Sin sesión, entra como anónimo (cliente). */
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        if (u) setUser(u);
        else signInAnonymously(auth).catch(() => setUser(null));
      }),
    []
  );
  return user;
}
