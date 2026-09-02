"use client";
import type { Experiment } from "@/lib/experiments";

const TIER_STYLES: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-200",
};

export function ExperimentCard({
  experiment,
  explanation,
  onSelect,
  disabled,
}: {
  experiment: Experiment;
  explanation?: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-lg dark:border-white dark:bg-zinc-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xl dark:bg-white">
            <span>{experiment.icon}</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold leading-none text-zinc-900 dark:text-white">
              {experiment.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-zinc-500">
              {experiment.durationHint} · Next recommended experiment
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${TIER_STYLES[experiment.safetyTier]}`}
        >
          Safety: {experiment.safetyTier}
        </span>
      </div>

      <div className={`mb-3 rounded-xl p-3 ${experiment.safetyTier === "medium" ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"}`}>
        <p className={`text-xs font-bold uppercase tracking-wider ${experiment.safetyTier === "medium" ? "text-amber-800 dark:text-amber-200" : "text-emerald-800 dark:text-emerald-200"}`}>
          {experiment.safetyTier === "medium" ? "⚠️ Safety — Adult supervision recommended" : "✓ Safety — Safe to do alone"}
        </p>
        <p className={`mt-1 text-sm leading-relaxed ${experiment.safetyTier === "medium" ? "text-amber-900 dark:text-amber-100" : "text-emerald-900 dark:text-emerald-100"}`}>
          {experiment.warning}
        </p>
        {experiment.safetyTier === "medium" && (
          <p className="mt-1 text-xs font-bold text-amber-800 dark:text-amber-200">⚠ Do this step with an adult.</p>
        )}
      </div>

      <div className="mb-4 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Instructions (pre-approved)
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-100">
          {experiment.instructions}
        </p>
        <p className="mt-2 text-[11px] text-zinc-500">
          ID <code className="rounded bg-white px-1 py-0.5 font-mono dark:bg-zinc-900">{experiment.id}</code> — selected deterministically by expected information gain, not by the AI.
        </p>
      </div>

      {explanation && (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            Why this experiment? (text AI, kid-friendly)
          </p>
          <p className="mt-1 text-sm leading-relaxed text-violet-900 dark:text-violet-100">
            {explanation}
          </p>
        </div>
      )}

      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
        What did you observe? (multiple choice only)
      </p>
      <div className="grid gap-2">
        {experiment.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            disabled={!!disabled}
            className="rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:border-white"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
