"use client";
import { useCallback, useRef, useState } from "react";

export function UploadCard({
  onCapture,
  imageDataUrl,
  disabled,
}: {
  onCapture: (dataUrl: string) => void;
  imageDataUrl: string | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);

  const startCam = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setUsingCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 50);
    } catch {}
  }, []);

  const stopCam = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setUsingCamera(false);
  }, [stream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
  }, [onCapture]);

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => onCapture(r.result as string);
      r.readAsDataURL(f);
    },
    [onCapture]
  );

  const hasImage = !!imageDataUrl && imageDataUrl !== "mock";

  return (
    <section className="flex flex-col gap-2">
      <div
        className="sketch-border ink-shadow bg-surface-container-lowest p-4 relative group cursor-pointer rotate-1 hover:rotate-0 transition-transform overflow-hidden min-h-[400px] flex items-center justify-center"
        onClick={() => !hasImage && !usingCamera && inputRef.current?.click()}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageDataUrl!} alt="Sample" className="absolute inset-0 w-full h-full object-cover" />
        ) : usingCamera ? (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/stitch/sample-rock.jpg')" }}
          />
        )}

        {!hasImage && (
          <div className="relative z-10 flex flex-col items-center gap-3 bg-surface-container/80 backdrop-blur-sm p-6 sketch-border group-hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center border-2 border-on-surface ink-shadow-sm -rotate-3">
              <span className="material-symbols-outlined" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>
                photo_camera
              </span>
            </div>
            <h2 className="font-semibold text-xl" style={{ fontFamily: "var(--font-quicksand)" }}>
              Upload New Photo
            </h2>
            <p className="text-sm text-on-surface-variant text-center max-w-[200px]" style={{ fontFamily: "var(--font-nunito)" }}>
              Drag a picture of your mystery object here!
            </p>
          </div>
        )}

        <div className="absolute -top-4 -left-4 w-16 h-8 bg-tertiary/30 border-2 border-on-surface -rotate-45 z-20" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-wrap gap-2">
        {!usingCamera ? (
          <button
            onClick={startCam}
            disabled={!!disabled}
            className="px-4 py-2 bg-white border-2 border-on-surface rounded-md ink-shadow-sm font-bold text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              videocam
            </span>
            Start camera
          </button>
        ) : (
          <>
            <button
              onClick={capture}
              className="px-4 py-2 bg-primary text-on-primary border-2 border-on-surface rounded-md ink-shadow-sm font-bold text-sm hover:-translate-y-0.5 transition-transform"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Capture photo
            </button>
            <button
              onClick={stopCam}
              className="px-4 py-2 bg-white border-2 border-on-surface rounded-md font-bold text-sm"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Stop
            </button>
          </>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!!disabled}
          className="px-4 py-2 bg-secondary-container border-2 border-on-surface rounded-md ink-shadow-sm font-bold text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Upload file
        </button>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} disabled={!!disabled} />
      </div>
    </section>
  );
}
