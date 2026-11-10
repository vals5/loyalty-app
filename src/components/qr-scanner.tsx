"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Flashlight, Keyboard } from "lucide-react";

type Props = {
  onResult: (text: string) => void;
  onManual: () => void;
};

/** Visor de cámara: lee QR en vivo. Necesita https (o localhost) y el permiso de cámara. */
export function QrScanner({ onResult, onManual }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const onResultRef = useRef(onResult);
  const [error, setError] = useState<string | null>(null);
  const [torchOk, setTorchOk] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    let stream: MediaStream | null = null;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("La cámara necesita una conexión segura (https). Usá el código manual.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        setError("No pudimos abrir la cámara. Revisá el permiso del navegador o usá el código manual.");
        return;
      }
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      setTorchOk(Boolean((track.getCapabilities?.() as { torch?: boolean } | undefined)?.torch));

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      if (!video || !canvas || !ctx) return;
      video.srcObject = stream;
      await video.play().catch(() => {});

      let last = 0;
      let lastText = "";
      let lastAt = 0;
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (now - last < 110 || video.readyState < 2 || !video.videoWidth) return; // ~9 lecturas por segundo
        last = now;
        const scale = Math.min(1, 640 / video.videoWidth);
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
        // No repite el mismo QR mientras sigue enfrente de la cámara
        if (code?.data && (code.data !== lastText || now - lastAt > 2500)) {
          lastText = code.data;
          lastAt = now;
          navigator.vibrate?.(40);
          onResultRef.current(code.data);
        }
      };
      raf = requestAnimationFrame(tick);
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      trackRef.current = null;
    };
  }, []);

  async function toggleTorch() {
    const track = trackRef.current;
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints);
      setTorchOn(next);
    } catch {
      setTorchOk(false);
    }
  }

  return (
    <section className="relative h-72 overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 to-boton">
      <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 size-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <p role="alert" className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-semibold text-white">{error}</p>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative size-44">
            {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((c) => (
              <span key={c} className={`absolute size-9 border-white ${c}`} />
            ))}
            <span className="absolute inset-x-2 h-0.5 animate-scan rounded-full bg-white shadow-[0_0_12px_white]" />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-linear-to-t from-black/60 to-transparent p-3 text-xs font-semibold text-white">
        {torchOk ? (
          <button type="button" onClick={toggleTorch} aria-pressed={torchOn} className="flex min-h-9 items-center gap-1.5"><Flashlight className="size-4" /> {torchOn ? "Apagar linterna" : "Linterna"}</button>
        ) : <span />}
        <button type="button" onClick={onManual} className="flex min-h-9 items-center gap-1.5"><Keyboard className="size-4" /> Código manual</button>
      </div>
    </section>
  );
}
