import { Check, Coffee, Croissant, Hamburger, PawPrint, Pizza, Scissors, Sprout, type LucideIcon } from "lucide-react";

/** Tipo de negocio = ícono que se "graba" en cada sello. Agregá más acá. */
export const STAMP_TYPES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "burger", label: "Burger", icon: Hamburger },
  { key: "bakery", label: "Panadería", icon: Croissant },
  { key: "cafe", label: "Café", icon: Coffee },
  { key: "plants", label: "Botánica", icon: Sprout },
  { key: "barber", label: "Barbería", icon: Scissors },
  { key: "pizza", label: "Pizza", icon: Pizza },
  { key: "pets", label: "Mascotas", icon: PawPrint },
  { key: "general", label: "General", icon: Check },
];

export function stampType(key?: string | null) {
  return STAMP_TYPES.find((t) => t.key === key) ?? STAMP_TYPES[STAMP_TYPES.length - 1];
}
