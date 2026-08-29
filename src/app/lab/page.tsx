"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import { UploadCard } from "@/components/UploadCard";
import { MentorBubble } from "@/components/MentorBubble";
import { NextStepCard } from "@/components/NextStepCard";
import { ConfidenceTubes } from "@/components/ConfidenceTubes";
import { EXPERIMENTS, getExperiment } from "@/lib/experiments";
import { bayesianUpdate, getTopCandidate, hasReachedThreshold, selectNextExperiment } from "@/lib/bayes";
import type { Distribution, EvidenceEntry } from "@/lib/bayes";
import { DEFAULT_THRESHOLD, ELEMENT_LABELS } from "@/lib/constants";

export default function LabPage() {
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [visionRaw, setVisionRaw] = useState<unknown>(null);
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [trail, setTrail] = useState<EvidenceEntry[]>([]);
  const [nextExpId, setNextExpId] = useState<string | null>(null);
  const [whyExplanation, setWhyExplanation] = useState<string | null>(null);
  const [whatExplanation, setWhatExplanation] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((j) => {
        if (typeof j.confidenceThreshold === "number") setThreshold(j.confidenceThreshold);
      })
      .catch(() => {});
  }, []);

  const top = useMemo(() => (distribution ? getTopCandidate(distribution) : null), [distribution]);
  const unknownWins = top?.id === "unknown" && finished;

  const reset = useCallback(() => {
    setImageDataUrl(null);
    setDistribution(null);
    setVisionRaw(null);
    setError(null);
    setCompleted([]);
    setTrail([]);
    setNextExpId(null);
    setWhyExplanation(null);
    setWhatExplanation(null);
    setFinished(false);
  }, []);

  const runVision = useCallback(
    async (dataUrl: string) => {
      setError(null);
      setClassifying(true);
      setDistribution(null);
      setVisionRaw(null);
      setCompleted([]);
      setTrail([]);
      setNextExpId(null);
      setWhyExplanation(null);
      setWhatExplanation(null);
      setFinished(false);
      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Vision failed (${res.status})`);
        const dist = json.distribution as Distribution;
        setDistribution(dist);
        setVisionRaw(json.raw);
        if (hasReachedThreshold(dist, threshold)) {
          setFinished(true);
        } else {
          const nxt = selectNextExperiment(dist, []);
          setNextExpId(nxt);
          if (!nxt) setFinished(true);
          if (nxt) {
            const exp = getExperiment(nxt);
            setLoadingExplain(true);
            fetch("/api/explain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind: "why_experiment",
                currentDistribution: dist,
                nextExperimentId: nxt,
                nextExperimentName: exp?.name,
              }),
            })
              .then((r) => r.json())
              .then((j) => setWhyExplanation(j.explanation))
              .catch(() => {})
              .finally(() => setLoadingExplain(false));
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setClassifying(false);
      }
    },
    [threshold]
  );

  const handleCapture = useCallback((dataUrl: string) => {
    setImageDataUrl(dataUrl);
    runVision(dataUrl);
  }, [runVision]);

  const handleMockVision = useCallback(() => {
    const mock: Distribution = {
      iron: 0.22,
      copper: 0.31,
      zinc: 0.11,
      aluminum: 0.14,
      sulfur: 0.05,
      graphite: 0.07,
      unknown: 0.1,
    };
    setImageDataUrl("mock");
    setDistribution(mock);
    setVisionRaw({ _mock: true });
    setCompleted([]);
    setTrail([]);
    const nxt = selectNextExperiment(mock, []);
    setNextExpId(nxt);
    setWhyExplanation("Mock mode: we picked the experiment that best splits the current top guesses — try it and see how the tubes move!");
    setError(null);
    setFinished(false);
  }, []);

  const handleOption = useCallback(
    async (optionId: string) => {
      if (!distribution || !nextExpId) return;
      const exp = getExperiment(nextExpId);
      if (!exp) return;
      const opt = exp.options.find((o) => o.id === optionId);
      if (!opt) return;
      const prior = { ...distribution };
      const posterior = bayesianUpdate(prior, nextExpId, optionId);
      const entry: EvidenceEntry = {
        round: trail.length + 1,
        experimentId: nextExpId,
        experimentName: exp.name,
        chosenOptionId: optionId,
        chosenLabel: opt.label,
        prior,
        posterior,
      };
      const newCompleted = [...completed, nextExpId];
      setTrail((t) => [...t, entry]);
      setCompleted(newCompleted);
      setDistribution(posterior);
      setWhatExplanation(null);
      setWhyExplanation(null);
      if (hasReachedThreshold(posterior, threshold)) {
        setFinished(true);
        setNextExpId(null);
      } else {
        const nxt = selectNextExperiment(posterior, newCompleted);
        setNextExpId(nxt);
        if (!nxt) {
          setFinished(true);
        } else {
          setLoadingExplain(true);
          const nextExp = getExperiment(nxt);
          fetch("/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "what_result_means",
              currentDistribution: posterior,
              lastExperimentId: nextExpId,
              lastExperimentName: exp.name,
              lastResultLabel: opt.label,
            }),
          })
            .then((r) => r.json())
            .then((j) => setWhatExplanation(j.explanation))
            .catch(() => {});
          fetch("/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "why_experiment",
              currentDistribution: posterior,
              nextExperimentId: nxt,
              nextExperimentName: nextExp?.name,
            }),
          })
            .then((r) => r.json())
            .then((j) => setWhyExplanation(j.explanation))
            .catch(() => {})
            .finally(() => setLoadingExplain(false));
        }
      }
    },
    [distribution, nextExpId, trail.length, completed, threshold]
  );

  const nextExperiment = nextExpId ? getExperiment(nextExpId) : null;
  const mentorText = !distribution
    ? "Upload a photo to start — I'll give you my first impression!"
    : finished
      ? unknownWins
        ? "Hmm, this doesn't look like any of our 6 kit elements — it must be an Unknown!"
        : `I think it's ${top ? ELEMENT_LABELS[top.id] : ""}! Great detective work!`
      : nextExperiment
        ? whyExplanation ?? (loadingExplain ? "Let me think why this test is best..." : `I think it might be ${top ? top.id : ""}, but it could be ${sortedSecond(distribution, top?.id)}! Let's test it with the ${nextExperiment.shortName}.`)
        : "Let's see what the tubes say!";

  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-on-surface border-dashed pb-3">
          <div>
            <h1 className="font-bold text-[32px] md:text-[48px] text-primary -rotate-1 inline-block" style={{ fontFamily: "var(--font-quicksand)" }}>
              Mystery Sample #102
            </h1>
            <p className="text-lg text-on-surface-variant mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
              Analyze the visual clues to deduce the element!
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/collection" className="flex items-center gap-1 px-3 py-2 bg-surface-container-high border-2 border-on-surface rounded-md ink-shadow-sm font-bold text-sm -rotate-1 hover:-translate-y-0.5 transition-transform" style={{ fontFamily: "var(--font-nunito)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                menu_book
              </span>
              My Lab Notebook
            </Link>
            <button className="flex items-center gap-1 px-3 py-2 bg-secondary-container border-2 border-on-surface rounded-md ink-shadow-sm font-bold text-sm rotate-1">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                health_and_safety
              </span>
              Safety Guide
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-7 flex flex-col gap-4">
            <UploadCard onCapture={handleCapture} imageDataUrl={imageDataUrl} disabled={classifying} />

            {/* Threshold + mock + debug */}
            <div className="sketch-border bg-white p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ fontFamily: "var(--font-quicksand)" }}>
                  Confidence threshold
                </span>
                <span className="px-2 py-1 bg-primary text-on-primary border-2 border-on-surface rounded-full font-bold text-xs">{(threshold * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min={0.6} max={0.95} step={0.05} value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} className="w-full accent-primary" />
              <p className="text-xs text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                Stop when top candidate ≥ threshold. Kit: iron, copper, zinc, aluminum, sulfur, graphite, + unknown.
              </p>
              {!distribution && !classifying && !error && (
                <button onClick={handleMockVision} className="mt-1 px-4 py-2 bg-secondary border-2 border-on-surface rounded-lg ink-shadow-sm font-bold text-sm hover:-translate-y-0.5 transition-transform">
                  Try mock first impression
                </button>
              )}
            </div>

            {classifying && (
              <div className="sketch-border bg-white p-6 text-center">
                <div className="mx-auto w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
                <p className="mt-3 font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
                  Asking vision AI for a first impression…
                </p>
                <p className="text-xs text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                  qwen2.5vl:3b via Ollama — no time limit, will retry on 504
                </p>
              </div>
            )}

            {error && (
              <div className="sketch-border bg-error-container border-error p-4">
                <p className="font-bold text-on-error-container">Vision call failed</p>
                <p className="text-xs font-mono break-words mt-1">{error}</p>
                <button onClick={handleMockVision} className="mt-3 px-4 py-2 bg-white border-2 border-on-surface rounded-full font-bold text-sm">
                  Continue in mock mode →
                </button>
              </div>
            )}

            {distribution ? <ConfidenceTubes distribution={distribution} /> : null}

            {visionRaw ? (
              <details className="sketch-border bg-surface-container p-3">
                <summary className="cursor-pointer font-bold text-xs uppercase tracking-wider">Debug: raw vision JSON</summary>
                <pre className="mt-2 bg-white p-3 border-2 border-on-surface rounded text-xs overflow-auto">{JSON.stringify(visionRaw, null, 2)}</pre>
              </details>
            ) : null}

            {trail.length > 0 && (
              <div className="sketch-border bg-white p-4">
                <h3 className="font-bold mb-3" style={{ fontFamily: "var(--font-quicksand)" }}>
                  Evidence trail
                </h3>
                <ol className="space-y-3">
                  {trail.map((e) => (
                    <li key={`${e.round}-${e.experimentId}`} className="border-2 border-outline-variant rounded-lg p-3 bg-surface-container-low">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span>Round {e.round}</span>
                        <span className="bg-white px-2 border rounded-full font-mono">{e.experimentId}</span>
                      </div>
                      <p className="font-semibold mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                        {e.experimentName} → {e.chosenLabel}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="md:col-span-5 flex flex-col gap-6">
            <MentorBubble text={mentorText} />

            {!distribution ? (
              <div className="sketch-border bg-white p-6">
                <h3 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
                  How it works
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm mt-3" style={{ fontFamily: "var(--font-nunito)" }}>
                  <li>Photo → vision AI rough first impression</li>
                  <li>If below threshold, deterministically recommend one experiment (expected information gain)</li>
                  <li>Report via multiple choice — confidence updates by Bayes</li>
                  <li>Repeat until confident or Unknown wins</li>
                </ol>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {EXPERIMENTS.map((e) => (
                    <div key={e.id} className="border-2 border-on-surface rounded-lg p-2 bg-surface-container-low text-xs">
                      <span className="font-bold">{e.icon} {e.shortName}</span>
                      <span className="ml-1 font-mono bg-white px-1 border rounded text-[10px]">{e.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : finished ? (
              <div className="sketch-border bg-white p-6 text-center ink-shadow">
                {unknownWins ? (
                  <>
                    <div className="mx-auto w-14 h-14 bg-tertiary-container border-2 border-on-surface rounded-full flex items-center justify-center text-2xl">❓</div>
                    <h2 className="mt-4 font-bold text-2xl" style={{ fontFamily: "var(--font-quicksand)" }}>
                      Not in my reference set
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
                      After {trail.length} experiments, Unknown is top at {(top ? top.confidence * 100 : 0).toFixed(1)}%
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-14 h-14 bg-secondary-container border-2 border-on-surface rounded-full flex items-center justify-center text-2xl">✓</div>
                    <h2 className="font-bold text-2xl mt-4" style={{ fontFamily: "var(--font-quicksand)" }}>
                      Identified: {top ? ELEMENT_LABELS[top.id] : "—"}
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
                      Top {(top ? top.confidence * 100 : 0).toFixed(1)}% clears {(threshold * 100).toFixed(0)}% after {trail.length} tests
                    </p>
                  </>
                )}
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={reset} className="px-5 py-2 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow-sm font-bold hover:-translate-y-0.5 transition-transform">
                    Identify New Sample
                  </button>
                  <Link href="/" className="px-5 py-2 bg-white border-2 border-on-surface rounded-xl font-bold hover:-translate-y-0.5 transition-transform inline-flex items-center">
                    Home
                  </Link>
                </div>
                <Link href="/results" className="mt-3 inline-block text-xs underline font-bold">
                  View detailed reasoning trail →
                </Link>
              </div>
            ) : nextExperiment ? (
              <NextStepCard experiment={nextExperiment} explanation={whyExplanation} loadingExplain={loadingExplain} onSelect={handleOption} />
            ) : null}

            {whatExplanation && !finished && (
              <div className="sketch-border bg-tertiary-container/30 border-tertiary p-4">
                <p className="font-bold text-xs uppercase tracking-wider">What your last result means</p>
                <p className="text-sm mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                  {whatExplanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}

function sortedSecond(dist: Distribution, topId?: string) {
  const ids = ["iron", "copper", "zinc", "aluminum", "sulfur", "graphite", "unknown"] as const;
  const sorted = [...ids].map((id) => ({ id, v: dist[id as keyof Distribution] ?? 0 })).sort((a, b) => b.v - a.v);
  return sorted.find((s) => s.id !== topId)?.id ?? "Unknown";
}
