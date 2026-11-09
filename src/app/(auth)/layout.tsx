import type { Viewport } from "next";

// Barra de estado del celular del mismo gris que el fondo (mismo valor que --color-fondo en globals.css)
export const viewport: Viewport = { themeColor: "#6f6866" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
