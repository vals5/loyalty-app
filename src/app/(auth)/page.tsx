import Link from "next/link";
import { Store, User } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-ui";
import { LoginForm } from "@/components/auth/login-form";
import { BrandFull } from "@/components/shared/brand-logo";
import { BRAND } from "@/lib/brand";

const option =
  "flex min-h-28 flex-col items-center justify-center gap-1 rounded-2xl border border-borde bg-campo p-3 text-center shadow-sm transition-transform active:scale-[0.98]";

export default function Home() {
  return (
    <AuthShell
      title={BRAND.name}
      logo={<BrandFull className="mx-auto h-24 w-auto sm:h-28" />}>
      <LoginForm />

      <section className="mt-auto pt-8" aria-labelledby="registro">
        <p id="registro" className="mb-3 text-center text-sm text-texto-sec">
          ¿No tenés cuenta? <span className="font-bold text-texto">Registrate como:</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/register" className={option}>
            <Store className="size-6 text-texto" aria-hidden />
            <span className="font-bold text-texto">Negocio</span>
            <span className="text-xs text-texto-sec">Creá la tarjeta de tu local</span>
          </Link>
          <Link href="/register/personal" className={option}>
            <User className="size-6 text-texto" aria-hidden />
            <span className="font-bold text-texto">Personal</span>
            <span className="text-xs text-texto-sec">Juntá sellos y premios</span>
          </Link>
        </div>
      </section>
    </AuthShell>
  );
}
