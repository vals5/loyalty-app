import type { ReactNode } from "react";

/** Fondo gris + hoja redondeada. Celular: ocupa toda la pantalla. Tablet/PC: tarjeta centrada. */
export function Sheet({ children, nav }: { children: ReactNode; nav?: ReactNode }) {
  return (
    <div className="fondo-total min-h-dvh bg-fondo p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex sm:items-center sm:justify-center sm:p-8">
      <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-clip rounded-[2rem] bg-hoja shadow-2xl shadow-black/20 sm:min-h-0 sm:max-w-120 sm:rounded-[2.5rem]">
        <div className="flex-1 px-4 pt-5 pb-6 sm:px-6">{children}</div>
        {nav}
      </div>
    </div>
  );
}
