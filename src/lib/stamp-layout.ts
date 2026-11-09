/**
 * Distribución de los sellos: 4 por fila y la última fila centrada
 * (10 sellos → 4 + 4 + 2, 6 → 4 + 2, 8 → 4 + 4, 12 → 4 + 4 + 4).
 * Se usa con gap de 0.5rem (gap-2): 3 huecos = 1.5rem.
 */
export const STAMP_GRID = "flex flex-wrap justify-center gap-2";
export const STAMP_CELL = "w-[calc((100%_-_1.5rem)/4)]";
