import { AuthShell, PrimaryLink, SecondaryLink } from "@/components/auth/auth-ui";

export default function Home() {
  return (
    <AuthShell title="Fidelidad App" subtitle="Tarjetas de fidelidad digitales para tu negocio.">
      <div className="mt-auto space-y-3 pt-8">
        <PrimaryLink href="/login">Ingresar</PrimaryLink>
        <SecondaryLink href="/register">Registrar negocio</SecondaryLink>
      </div>
    </AuthShell>
  );
}
