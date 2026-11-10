import { parseQrPayload } from "@/lib/firebase/collections";

export type ScanResult =
  | { kind: "card"; slug: string; uid: string } // QR de un cliente: "loyalty:<slug>:<uid>"
  | { kind: "business"; slug: string }; // QR/link del local: ".../c/<slug>" (o el código a mano)

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validSlug = (s: string) => s.length >= 3 && s.length <= 40 && SLUG.test(s);

export function parseScan(raw: string): ScanResult | null {
  const text = raw.trim();
  const card = parseQrPayload(text);
  if (card) return { kind: "card", slug: card.slug, uid: card.customerUid };

  try {
    const m = new URL(text).pathname.match(/^\/c\/([^/]+)\/?$/);
    if (m) {
      const slug = decodeURIComponent(m[1]).toLowerCase();
      if (validSlug(slug)) return { kind: "business", slug };
    }
  } catch {
    /* no era una URL: puede ser el código a mano */
  }

  const slug = text.toLowerCase();
  return validSlug(slug) ? { kind: "business", slug } : null;
}
