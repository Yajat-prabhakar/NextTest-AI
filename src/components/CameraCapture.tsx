"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function CameraCapture({
  onCapture,
  disabled,
}: {
  onCapture: (dataUrl: string, file?: File) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);

  const stop = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setUsingCamera(false);
  }, [stream]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(s);
      setUsingCamera(true);
      // wait for video element
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 50);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
  }, [onCapture]);

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        onCapture(url, file);
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-2 text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
        1 · Photograph your sample
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        Place the sample on a plain background in good light. We’ll ask the
        vision AI for a first impression — it’s a rough guess, not a final
        answer.
      </p>

      <div className="relative overflow-hidden rounded-xl bg-zinc-950">
        {usingCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 bg-zinc-900 p-6 text-center">
            <div className="text-3xl">📸</div>
            <p className="text-sm font-medium text-zinc-200">
              Camera is off — start it or upload a photo
            </p>
            {error && (
              <p className="max-w-sm text-xs text-red-300">{error}</p>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-3 flex flex-wrap gap-2">
        {!usingCamera ? (
          <button
            onClick={start}
            disabled={!!disabled}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            Start camera
          </button>
        ) : (
          <>
            <button
              onClick={capture}
              disabled={!!disabled}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Capture photo
            </button>
            <button
              onClick={stop}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Stop camera
            </button>
          </>
        )}

        <label className="cursor-pointer rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          Upload photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFile}
            disabled={!!disabled}
          />
        </label>
      </div>
    </div>
  );
}
