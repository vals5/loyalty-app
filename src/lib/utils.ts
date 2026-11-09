export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "c",
  "dashboard",
  "login",
  "register",
  "scan",
  "settings",
  "tarjetas",
  "forgot-password",
]);

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return (
    slug.length >= 3 &&
    slug.length <= 40 &&
    SLUG_REGEX.test(slug) &&
    !RESERVED_SLUGS.has(slug)
  );
}