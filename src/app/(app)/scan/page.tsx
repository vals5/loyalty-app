"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { QrScanner } from "@/components/qr-scanner";
import { StampScreen } from "@/components/stamp-screen";
import { inputCls } from "@/components/shared/panel";
import { useOwnerBusiness } from "@/lib/firebase/use-owner-business";
import { parseScan } from "@/lib/scan";
import { BRAND } from "@/lib/brand";

export default function ScanPage() {
  const router = useRouter();
  const { status, business } = useOwnerBusiness();
  const [clientUid, setClientUid] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handle(raw: string) {
    if (status === "loading") return; // todavía no sabemos si es dueño o cliente
    const scan = parseScan(raw);
    if (!scan) {
      setNotice(`Ese código no es de ${BRAND.name}.`);
      return;
    }
    // QR/link de un local: abre su tarjeta para sumarla
    if (scan.kind === "business") {
      router.push(`/c/${scan.slug}`);
      return;
    }
    // QR de un cliente: solo lo puede usar el dueño de ese comercio
    if (!business) {
      setNotice("Ese es el QR de un cliente: lo escanea el comercio. Para sumar una tarjeta nueva, escaneá el QR del local.");
      return;
    }
    if (scan.slug !== business.slug) {
      setNotice("Ese QR es de una tarjeta de otro comercio.");
      return;
    }
    setNotice(null);
    setManual(false);
    setClientUid(scan.uid);
  }

  function submitManual(e: FormEvent) {
    e.preventDefault();
    handle(code);
  }

  if (clientUid && business) {
    return <StampScreen business={business} uid={clientUid} onDone={() => setClientUid(null)} />;
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold text-texto">Escanear</h1>
        <p className="text-sm text-texto-sec">
          Apuntá al QR de un local para sumar su tarjeta{business ? " o al QR de un cliente para sumarle sellos" : ""}.
        </p>
      </header>

      <QrScanner onResult={handle} onManual={() => setManual((v) => !v)} />

      {notice && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-error/20 bg-error-suave px-3 py-2.5 text-sm text-error">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> {notice}
        </p>
      )}

      {manual && (
        <form onSubmit={submitManual} className="space-y-2">
          <label htmlFor="manual-code" className="block text-sm font-semibold text-texto">Código del local o link</label>
          <div className="flex gap-2">
            <input id="manual-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ej: burger-artisan" autoCapitalize="none" autoCorrect="off" className={`${inputCls} min-w-0 flex-1`} />
            <button className="min-h-12 rounded-xl bg-boton px-4 text-sm font-bold text-white active:scale-95">Abrir</button>
          </div>
        </form>
      )}
    </div>
  );
}
