"use client";
import type { EvidenceEntry } from "@/lib/bayes";
import { getExperiment } from "@/lib/experiments";
import { ELEMENT_IDS } from "@/lib/constants";

export function EvidenceTrail({ trail }: { trail: EvidenceEntry[] }) {
  if (trail.length === 0) return null;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-bold text-zinc-900 dark:text-white">
        Evidence trail
      </h3>
      <ol className="space-y-3">
        {trail.map((e) => {
          const exp = getExperiment(e.experimentId);
          return (
            <li
              key={`${e.round}-${e.experimentId}`}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Round {e.round}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-mono dark:bg-zinc-900">
                  {e.experimentId}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {exp?.name ?? e.experimentName} → {e.chosenLabel}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ELEMENT_IDS.slice(0, 7).map((id) => {
                  const before = e.prior[id] ?? 0;
                  const after = e.posterior[id] ?? 0;
                  const delta = after - before;
                  if (Math.abs(delta) < 0.005) return null;
                  const up = delta > 0;
                  return (
                    <span
                      key={id}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${up ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"}`}
                    >
                      {id}: {(before * 100).toFixed(0)}% → {(after * 100).toFixed(0)}% {up ? "↗" : "↘"}
                    </span>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
