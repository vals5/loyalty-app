/** Color de texto (blanco o casi negro) que se lee bien sobre el color de la tarjeta. */
export function onBrand(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#131515" : "#ffffff";
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100, lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}

/** Los 12 colores generales de la rueda cromática (un tono cada 30°). */
export const WHEEL_COLORS = [
  { name: "Rojo", h: 0 }, { name: "Naranja", h: 30 }, { name: "Amarillo", h: 55 }, { name: "Lima", h: 90 },
  { name: "Verde", h: 130 }, { name: "Menta", h: 160 }, { name: "Cian", h: 185 }, { name: "Celeste", h: 210 },
  { name: "Azul", h: 235 }, { name: "Violeta", h: 270 }, { name: "Magenta", h: 305 }, { name: "Rosa", h: 335 },
].map(({ name, h }) => ({ name, color: hslToHex(h, 78, 46) }));
