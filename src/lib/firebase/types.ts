import type { Timestamp } from "firebase/firestore";

/** Recompensa que se desbloquea al llegar al sello `at` (1 = primer sello). */
export interface RewardLevel {
  at: number;
  name: string;
}

export interface Business {
  slug: string; // igual al ID del documento
  name: string;
  ownerUid: string; // uid de Firebase Auth del dueño
  primaryColor: string; // "#E11D48"
  logoUrl: string | null;
  stampsRequired: number; // sellos para obtener el premio
  reward: string; // recompensa final (último sello)
  extraRewards?: RewardLevel[]; // recompensas intermedias (sello < stampsRequired); puede faltar en comercios viejos
  // Info del local (puede faltar en comercios creados antes: leer con ?? null)
  description: string | null;
  address: string | null;
  hours: string | null;
  phone: string | null;
  stampIcon: string | null; // clave de lib/stamp-types.ts (null = genérico)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Card {
  customerUid: string; // igual al ID del documento; es el token del QR
  businessSlug: string;
  customerName: string | null;
  stamps: number; // sellos vigentes (se restan al canjear)
  totalStamps: number; // sellos históricos
  redeemedCount: number; // premios canjeados
  createdAt: Timestamp;
  lastStampAt: Timestamp | null;
}

export type HistoryType = "stamp" | "redeem";

export interface HistoryEntry {
  type: HistoryType;
  cardId: string; // customerUid
  amount: number; // sellos sumados o restados
  createdBy: string; // uid de quien escaneó
  createdAt: Timestamp;
}
