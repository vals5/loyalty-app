import { Suspense } from "react";
import { CustomerCard } from "@/components/customer-card";
import { Sheet } from "@/components/shared/sheet";

type Params = Promise<{ business_slug: string }>;

async function CardContent({ params }: { params: Params }) {
  const { business_slug } = await params;
  return <CustomerCard slug={business_slug.toLowerCase()} />;
}

export default function CustomerCardPage({ params }: { params: Params }) {
  return (
    <Sheet>
      <Suspense fallback={<p className="py-16 text-center text-texto-sec">Cargando…</p>}>
        <CardContent params={params} />
      </Suspense>
    </Sheet>
  );
}
