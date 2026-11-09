// Comercios cuya tarjeta ya creó este dispositivo (la sesión anónima también es por dispositivo).
const KEY = "my-card-slugs";

export function getSavedSlugs(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function saveSlug(slug: string) {
  try {
    const list = getSavedSlugs();
    if (!list.includes(slug)) localStorage.setItem(KEY, JSON.stringify([slug, ...list]));
  } catch {
    /* storage no disponible: la tarjeta sigue funcionando, solo no se lista */
  }
}
