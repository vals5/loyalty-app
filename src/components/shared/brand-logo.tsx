/* eslint-disable @next/next/no-img-element */
import { BRAND } from "@/lib/brand";
import { LogoFull, LogoMark } from "./logo";

/** Ícono de la marca: usa el PNG de lib/brand.ts si está cargado; si no, el SVG incluido. */
export function BrandMark({ className }: { className?: string }) {
  return BRAND.logoIcon ? (
    <img src={BRAND.logoIcon} alt="" className={`${className ?? ""} object-contain`} />
  ) : (
    <LogoMark className={className} />
  );
}

/** Logo completo (con nombre y lema): PNG de lib/brand.ts o SVG incluido. */
export function BrandFull({ className }: { className?: string }) {
  return BRAND.logoFull ? (
    <img src={BRAND.logoFull} alt={`${BRAND.name}, ${BRAND.tagline.toLowerCase()}`} className={`${className ?? ""} object-contain`} />
  ) : (
    <LogoFull className={`${className ?? ""} text-black`} />
  );
}
