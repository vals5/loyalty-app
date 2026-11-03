import { Suspense } from "react";

type Params = Promise<{ business_slug: string }>;

async function CardContent({ params }: { params: Params }) {
  const { business_slug } = await params;
  return <h1 className="text-2xl font-bold">Tarjeta de {business_slug}</h1>;
}

export default function CustomerCardPage({ params }: { params: Params }) {
  return (
    <main className="p-6">
      <Suspense fallback={<p>Cargando…</p>}>
        <CardContent params={params} />
      </Suspense>
    </main>
  );
}
