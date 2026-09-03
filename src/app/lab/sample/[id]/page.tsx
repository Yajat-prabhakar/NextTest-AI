"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import { UploadCard } from "@/components/UploadCard";
import { NextStepCard } from "@/components/NextStepCard";
import { ConfidenceTubes } from "@/components/ConfidenceTubes";
import { EvidenceLog } from "@/components/EvidenceLog";
import { getExperiment } from "@/lib/experiments";
import { bayesianUpdate, getTopCandidate, hasReachedThreshold, selectNextExperiment } from "@/lib/bayes";
import type { Distribution, EvidenceEntry } from "@/lib/bayes";
import { ELEMENT_LABELS } from "@/lib/constants";
import { useLabContext } from "@/lib/store";

export default function ActiveInvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { samples, updateSample, threshold, setThreshold } = useLabContext();
  const state = samples[id];

  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Redirect once solved
  useEffect(() => {
    if (state?.status === "solved") {
      router.replace(`/lab/sample/${id}/result`);
    }
  }, [state?.status, id, router]);

  const top = state?.distribution ? getTopCandidate(state.distribution) : null;

  const runVision = useCallback(
    async (dataUrl: string) => {
      setError(null);
      setClassifying(true);
      updateSample(id, {
        imageDataUrl: dataUrl,
        distribution: null,
        visionRaw: null,
        completed: [],
        trail: [],
        nextExpId: null,
        whyExplanation: null,
        whatExplanations: {},
        finished: false,
      });

      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Vision failed (${res.status})`);
        const dist = json.distribution as Distribution;

        if (hasReachedThreshold(dist, threshold)) {
          updateSample(id, {
            distribution: dist,
            visionRaw: json.raw,
            finished: true,
            identifiedElementId: getTopCandidate(dist).id,
            dateSolved: new Date().toISOString(),
          });
        } else {
          const nxt = selectNextExperiment(dist, []);
          updateSample(id, {
            distribution: dist,
            visionRaw: json.raw,
            nextExpId: nxt,
            finished: !nxt,
            ...(!nxt ? { identifiedElementId: getTopCandidate(dist).id, dateSolved: new Date().toISOString() } : {}),
          });
          if (nxt) {
            const exp = getExperiment(nxt);
            setLoadingExplain(true);
            fetch("/api/explain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kind: "why_experiment", currentDistribution: dist, nextExperimentId: nxt, nextExperimentName: exp?.name }),
            })
              .then((r) => r.json())
              .then((j) => updateSample(id, { whyExplanation: j.explanation }))
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
    [threshold, id, updateSample]
  );

  const handleCapture = useCallback((dataUrl: string) => runVision(dataUrl), [runVision]);

  const handleOption = useCallback(
    async (optionId: string) => {
      if (!state?.distribution || !state?.nextExpId) return;
      const exp = getExperiment(state.nextExpId);
      if (!exp) return;
      const opt = exp.options.find((o) => o.id === optionId);
      if (!opt) return;

      const prior = { ...state.distribution };
      const posterior = bayesianUpdate(prior, state.nextExpId, optionId);
      const round = state.trail.length + 1;
      const entry: EvidenceEntry = {
        round,
        experimentId: state.nextExpId,
        experimentName: exp.name,
        chosenOptionId: optionId,
        chosenLabel: opt.label,
        prior,
        posterior,
      };

      const newCompleted = [...state.completed, state.nextExpId];
      const newTrail = [...state.trail, entry];

      updateSample(id, {
        trail: newTrail,
        completed: newCompleted,
        distribution: posterior,
        whyExplanation: null,
      });

      if (hasReachedThreshold(posterior, threshold)) {
        updateSample(id, {
          finished: true,
          nextExpId: null,
          identifiedElementId: getTopCandidate(posterior).id,
          dateSolved: new Date().toISOString(),
        });
      } else {
        const nxt = selectNextExperiment(posterior, newCompleted);
        updateSample(id, {
          nextExpId: nxt,
          finished: !nxt,
          ...(!nxt ? { identifiedElementId: getTopCandidate(posterior).id, dateSolved: new Date().toISOString() } : {}),
        });

        if (nxt) {
          setLoadingExplain(true);
          const nextExp = getExperiment(nxt);

          // "what it means" → stored per-round inside whatExplanations, shown in EvidenceLog
          fetch("/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "what_result_means", currentDistribution: posterior, lastExperimentId: state.nextExpId, lastExperimentName: exp.name, lastResultLabel: opt.label }),
          })
            .then((r) => r.json())
            .then((j) => {
              if (j.explanation) {
                updateSample(id, {
                  whatExplanations: { ...(state.whatExplanations ?? {}), [round]: j.explanation },
                });
              }
            })
            .catch(() => {});

          // "why next test" → shown in NextStepCard before the student runs it
          fetch("/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "why_experiment", currentDistribution: posterior, nextExperimentId: nxt, nextExperimentName: nextExp?.name }),
          })
            .then((r) => r.json())
            .then((j) => updateSample(id, { whyExplanation: j.explanation }))
            .catch(() => {})
            .finally(() => setLoadingExplain(false));
        }
      }
    },
    [state, threshold, id, updateSample]
  );

  if (!state) return null;

  const nextExperiment = state.nextExpId ? getExperiment(state.nextExpId) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col gap-6">

        {/* ── Top bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-on-surface border-dashed pb-3">
          <div className="flex items-center gap-4">
            <Link href="/lab" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-bold" style={{ fontFamily: "var(--font-nunito)" }}>Lab</span>
            </Link>
            <h1 className="font-bold text-[24px] md:text-[32px] text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
              Sample #{id}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Threshold slider — compact, inline in top bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-bold hidden md:block" style={{ fontFamily: "var(--font-nunito)" }}>Threshold</span>
              <input
                type="range" min={0.6} max={1.0} step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-24 accent-primary"
              />
              <span className="px-2 py-0.5 bg-primary text-on-primary border-2 border-on-surface rounded-full font-bold text-xs">
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>
            {/* Status chip */}
            {state.distribution ? (
              <span className="px-3 py-1 bg-surface-container-high border-2 border-on-surface rounded-full text-sm font-bold">
                {top ? `${(top.confidence * 100).toFixed(0)}% ${ELEMENT_LABELS[top.id as keyof typeof ELEMENT_LABELS]?.split(" ")[0] || top.id}` : "Investigating…"}
              </span>
            ) : (
              <span className="px-3 py-1 border-2 border-outline-variant rounded-full text-sm font-bold text-on-surface-variant">
                Awaiting Photo
              </span>
            )}
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Upload / Photo + Evidence Log */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {!state.distribution ? (
              <UploadCard onCapture={handleCapture} imageDataUrl={state.imageDataUrl} disabled={classifying} />
            ) : (
              <div className="sketch-border p-4 bg-white flex items-center gap-4 -rotate-[0.3deg]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.imageDataUrl!} alt="Sample" className="w-20 h-20 object-cover rounded-lg border-2 border-on-surface shrink-0" />
                <div>
                  <p className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>Initial Photo</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Uploaded · evidence loop started</p>
                </div>
              </div>
            )}

            {classifying && (
              <div className="sketch-border bg-white p-6 text-center">
                <div className="mx-auto w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
                <p className="mt-3 font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>Analyzing sample…</p>
                <p className="text-xs text-on-surface-variant mt-1" style={{ fontFamily: "var(--font-nunito)" }}>Vision model warming up — this may take a few seconds</p>
              </div>
            )}

            {error && (
              <div className="sketch-border bg-error-container border-error p-4">
                <p className="font-bold text-on-error-container">Vision call failed</p>
                <p className="text-xs font-mono break-words mt-1">{error}</p>
                <button
                  onClick={() => updateSample(id, { imageDataUrl: null })}
                  className="mt-3 px-4 py-2 bg-white border-2 border-on-surface rounded-full font-bold text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Evidence Log — single source of truth for all past reasoning */}
            <EvidenceLog trail={state.trail} whatExplanations={state.whatExplanations} />
          </div>

          {/* Right: Live Confidence + Next Step */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {state.distribution && (
              <>
                {/* Live Confidence Panel */}
                <div className="sketch-border bg-white p-6 ink-shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-xl" style={{ fontFamily: "var(--font-quicksand)" }}>
                      Live Confidence
                    </h2>
                    <span className="text-xs text-on-surface-variant font-bold px-2 py-0.5 border border-outline-variant rounded-full" style={{ fontFamily: "var(--font-nunito)" }}>
                      Updates with each test
                    </span>
                  </div>
                  <ConfidenceTubes distribution={state.distribution} />
                </div>

                {/* Next Step — forward-looking only */}
                {nextExperiment && (
                  <NextStepCard
                    experiment={nextExperiment}
                    explanation={state.whyExplanation}
                    loadingExplain={loadingExplain}
                    onSelect={handleOption}
                  />
                )}
              </>
            )}

            {!state.distribution && !classifying && !error && (
              <div className="sketch-border bg-surface-container p-8 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-5xl opacity-30">science</span>
                <p className="font-bold text-lg" style={{ fontFamily: "var(--font-quicksand)" }}>Awaiting initial evidence</p>
                <p className="text-sm" style={{ fontFamily: "var(--font-nunito)" }}>Upload or take a photo of your mystery sample to begin.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}
