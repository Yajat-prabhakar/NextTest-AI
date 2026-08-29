"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { ConfidenceBars } from "@/components/ConfidenceBars";
import { ExperimentCard } from "@/components/ExperimentCard";
import { EvidenceTrail } from "@/components/EvidenceTrail";
import { EXPERIMENTS, getExperiment } from "@/lib/experiments";
import {
  bayesianUpdate,
  getTopCandidate,
  hasReachedThreshold,
  selectNextExperiment,
} from "@/lib/bayes";
import type { Distribution, EvidenceEntry } from "@/lib/bayes";
import { DEFAULT_THRESHOLD, ELEMENT_LABELS } from "@/lib/constants";

type ClientConfig = {
  hasEndpoint: boolean;
  visionModel: string;
  textModel: string;
  confidenceThreshold: number;
};

export default function Home() {
  const [config, setConfig] = useState<ClientConfig | null>(null);
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

  // fetch config
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((j) => {
        setConfig(j);
        if (typeof j.confidenceThreshold === "number")
          setThreshold(j.confidenceThreshold);
      })
      .catch(() => setConfig({ hasEndpoint: false, visionModel: "qwen2.5vl:3b", textModel: "qwen2.5:3b", confidenceThreshold: DEFAULT_THRESHOLD }));
  }, []);

  const top = useMemo(
    () => (distribution ? getTopCandidate(distribution) : null),
    [distribution]
  );
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
        // decide next step
        if (hasReachedThreshold(dist, threshold)) {
          setFinished(true);
        } else {
          const nxt = selectNextExperiment(dist, []);
          setNextExpId(nxt);
          if (!nxt) setFinished(true);
          // fetch why explanation
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

  const handleCapture = useCallback(
    (dataUrl: string) => {
      setImageDataUrl(dataUrl);
      runVision(dataUrl);
    },
    [runVision]
  );

  const handleMockVision = useCallback(() => {
    // Deterministic mock for demos without Ollama — use a flat-ish but plausible distribution
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
    setVisionRaw({ _mock: true, note: "Mock distribution — no Ollama call" });
    setCompleted([]);
    setTrail([]);
    const nxt = selectNextExperiment(mock, []);
    setNextExpId(nxt);
    setWhyExplanation(
      "Mock mode: we picked the experiment that best splits the current top guesses — try it and see how the bars move!"
    );
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

      // check finish
      if (hasReachedThreshold(posterior, threshold)) {
        setFinished(true);
        setNextExpId(null);
      } else {
        const nxt = selectNextExperiment(posterior, newCompleted);
        setNextExpId(nxt);
        if (!nxt) {
          setFinished(true);
        } else {
          // параллельно fetch both explanations — what last result means + why next
          setLoadingExplain(true);
          const nextExp = getExperiment(nxt);
          // what result means
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
          // why next
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="text-sm font-black">Nt</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-base">
                NextTest AI
              </h1>
              <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
                Adaptive element identification kit · 6-material reference
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 sm:inline-flex">
              ⚡ Network validation prototype
            </span>
            <button
              onClick={reset}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Prototype banner */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/40 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
            <span className="font-extrabold">Validation prototype — requires network access to Ollama.</span>{" "}
            This build calls a self-hosted vision LLM (<code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">qwen2.5vl:3b</code>) at{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">POST /v1/chat/completions</code> — not the offline demo build.
            Config via <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">OLLAMA_BASE_URL</code> /{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900">OLLAMA_API_KEY</code>. {!config?.hasEndpoint && "No endpoint configured — use Mock mode below."}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left column — capture + confidence */}
          <div className="space-y-4">
            <CameraCapture onCapture={handleCapture} disabled={classifying} />

            {imageDataUrl && imageDataUrl !== "mock" && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Captured sample</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUrl} alt="Captured sample" className="max-h-64 w-full rounded-xl object-contain bg-zinc-100 dark:bg-zinc-800" />
              </div>
            )}

            {/* Threshold control */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-white">Confidence threshold</label>
                <span className="rounded-full bg-zinc-900 px-2.5 py-1 font-mono text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                  {(threshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.6}
                max={0.95}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(Number.parseFloat(e.target.value))}
                className="mt-3 w-full accent-zinc-900 dark:accent-white"
              />
              <p className="mt-2 text-xs text-zinc-500">Stop when top candidate ≥ threshold. Default 85%.</p>
            </div>

            {classifying && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Asking vision AI for a first impression…</p>
                <p className="mt-1 text-xs text-zinc-500">qwen2.5vl:3b via Ollama — zero-shot, rough guess only</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                <p className="text-sm font-bold text-red-800 dark:text-red-200">Vision call failed</p>
                <p className="mt-1 break-words font-mono text-xs text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={handleMockVision}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white"
                >
                  Continue in mock mode →
                </button>
              </div>
            )}

            {!distribution && !classifying && !error && (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  Capture or upload a photo to begin. Without a network endpoint you can also use mock mode:
                </p>
                <button
                  onClick={handleMockVision}
                  className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  Try mock first impression
                </button>
                <p className="mt-2 text-xs text-zinc-500">Bayesian loop works fully offline — only the first impression needs the LLM.</p>
              </div>
            )}

            {distribution ? <ConfidenceBars distribution={distribution} /> : null}

            {visionRaw ? (
              <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Debug: raw vision JSON
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-white p-3 font-mono text-xs dark:bg-zinc-950">
                  {JSON.stringify(visionRaw, null, 2)}
                </pre>
              </details>
            ) : null}

            <EvidenceTrail trail={trail} />
          </div>

          {/* Right column — experiment loop + result */}
          <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            {!distribution ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">How it works</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <li>Photograph the unknown sample → vision AI gives a rough “first impression” distribution.</li>
                  <li>If confidence is below threshold, we deterministically recommend one experiment (expected information gain).</li>
                  <li>Perform it, report via multiple choice — confidence updates by Bayes (hand-authored likelihoods).</li>
                  <li>Repeat until confident, or we admit “not in my reference set” if Unknown wins.</li>
                </ol>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {EXPERIMENTS.map((e) => (
                    <div key={e.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {e.icon} {e.shortName}
                      </span>
                      <span className="ml-2 rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-900">{e.id}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-zinc-500">AI only selects an experiment ID — it never generates instructions or warnings live. All menu entries are pre-approved.</p>
              </div>
            ) : finished ? (
              <div className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-xl dark:border-white dark:bg-zinc-900">
                {unknownWins ? (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-900/40">❓</div>
                    <h2 className="mt-4 text-center text-xl font-black text-zinc-900 dark:text-white">Not in my reference set</h2>
                    <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      After {trail.length} experiment{trail.length !== 1 ? "s" : ""}, “Unknown” is the top candidate at{" "}
                      <span className="font-bold">{((top?.confidence ?? 0) * 100).toFixed(1)}%</span>. This sample doesn’t look like any of the 6 kit materials.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900/40">✓</div>
                    <h2 className="mt-4 text-center text-xl font-black text-zinc-900 dark:text-white">
                      Identified: {top ? ELEMENT_LABELS[top.id] : "—"}
                    </h2>
                    <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      Top confidence <span className="font-bold">{((top?.confidence ?? 0) * 100).toFixed(1)}%</span> clears the {(threshold * 100).toFixed(0)}% threshold after {trail.length} experiment{trail.length !== 1 ? "s" : ""}.
                      {top?.id === "unknown" ? "" : " Ready to log your conclusion?"}
                    </p>
                  </>
                )}
                <div className="mt-5 flex justify-center gap-2">
                  <button
                    onClick={reset}
                    className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  >
                    Test another sample
                  </button>
                </div>
                <p className="mt-4 text-center text-xs text-zinc-500">
                  Deterministic Bayesian result — probabilities from hand-authored likelihood table, not from the language model.
                </p>
              </div>
            ) : nextExperiment ? (
              <ExperimentCard
                experiment={nextExperiment}
                explanation={whyExplanation ?? (loadingExplain ? "Thinking of a kid-friendly reason…" : null)}
                onSelect={handleOption}
              />
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">No more experiments to run — see your evidence trail.</p>
              </div>
            )}

            {whatExplanation && !finished && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">What your last result means</p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{whatExplanation}</p>
              </div>
            )}

            {distribution && !finished && nextExpId && (
              <p className="px-1 text-xs leading-relaxed text-zinc-500">
                Top: <span className="font-bold text-zinc-900 dark:text-white">{top ? `${ELEMENT_LABELS[top.id]} · ${((top.confidence ?? 0) * 100).toFixed(1)}%` : "—"}</span> · Threshold {(threshold * 100).toFixed(0)}% · {completed.length} / {EXPERIMENTS.length} experiments used
              </p>
            )}

            {/* Footer note */}
            <div className="rounded-2xl bg-zinc-900 p-4 text-zinc-100 dark:bg-zinc-800">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">What we’re validating</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                Whether the zero-shot vision LLM’s rough guess is good enough to seed the Bayesian loop — or whether we’ll need the trained closed-set classifier later. The loop itself is already deterministic and offline-capable.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
        <div className="mx-auto max-w-6xl text-center text-xs text-zinc-500">
          NextTest AI · Validation prototype · Network required · Ollama endpoint via <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">OLLAMA_BASE_URL</code> · Likelihoods are hand-authored, not learned.
        </div>
      </footer>
    </div>
  );
}
