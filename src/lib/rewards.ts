import type { Business, RewardLevel } from "@/lib/firebase/types";

/**
 * Todas las recompensas de la tarjeta, ordenadas por sello.
 * Las intermedias viven en `extraRewards`; la final siempre es `reward`
 * y cae en el último sello (stampsRequired).
 */
export function rewardLevels(b: Pick<Business, "stampsRequired" | "reward" | "extraRewards">): RewardLevel[] {
  const extra = (b.extraRewards ?? [])
    .filter((r) => Number.isInteger(r.at) && r.at >= 1 && r.at < b.stampsRequired && r.name)
    .sort((a, c) => a.at - c.at);
  return [...extra, { at: b.stampsRequired, name: b.reward }];
}
