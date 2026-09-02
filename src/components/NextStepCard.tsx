"use client";
import type { Experiment } from "@/lib/experiments";

const safetyEmoji: Record<string, string> = {
  low: "health_and_safety",
  medium: "warning",
  high: "dangerous",
};

export function NextStepCard({
  experiment,
  explanation,
  onSelect,
  loadingExplain,
  disabled,
}: {
  experiment: Experiment;
  explanation?: string | null;
  onSelect: (optionId: string) => void;
  loadingExplain?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="bg-surface-container sketch-border ink-shadow-primary p-6 flex flex-col gap-3 rotate-1">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-1 bg-primary-container text-on-primary-container font-bold text-xs rounded border-2 border-on-surface -rotate-2 mb-1" style={{ fontFamily: "var(--font-nunito)" }}>
            Next Step
          </span>
          <h3 className="font-bold text-[28px] leading-none" style={{ fontFamily: "var(--font-quicksand)" }}>
            {experiment.name}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center border-2 border-on-surface rotate-3">
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
            {safetyEmoji[experiment.safetyTier] ?? "warning"}
          </span>
        </div>
      </div>

      {explanation && (
        <div className="bg-primary-fixed/60 border-2 border-outline-variant rounded-lg p-3 -rotate-1">
          <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
            {loadingExplain ? "Thinking of a kid-friendly reason…" : explanation}
          </p>
        </div>
      )}

      <p className="text-sm text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
        {experiment.instructions}
      </p>

      <div className={`border-2 rounded-lg p-3 flex gap-2 items-start ${experiment.safetyTier === "medium" ? "bg-amber-50 border-amber-300" : "bg-secondary-container/50 border-outline-variant"}`}>
        <span className={`material-symbols-outlined ${experiment.safetyTier === "medium" ? "text-amber-700" : "text-secondary"}`} style={{ fontSize: 20 }}>
          {experiment.safetyTier === "medium" ? "warning" : "health_and_safety"}
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold" style={{ fontFamily: "var(--font-nunito)" }}>
            Safety: {experiment.safetyTier} — {experiment.warning}
          </p>
          {experiment.safetyTier === "medium" && (
            <p className="text-xs font-bold text-amber-800" style={{ fontFamily: "var(--font-nunito)" }}>
              ⚠ Adult supervision recommended for this test.
            </p>
          )}
          {experiment.safetyTier === "low" && (
            <p className="text-[11px] text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
              Safe to do alone — physical/observational only, no heat or mixing.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
        What did you observe?
      </p>
      <div className="grid gap-2">
        {experiment.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            disabled={!!disabled}
            className="px-4 py-3 bg-white border-2 border-on-surface rounded-lg ink-shadow-sm font-semibold text-sm text-left hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform disabled:opacity-50"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
        ID <code className="bg-white px-1 py-0.5 border border-outline-variant rounded">{experiment.id}</code> — selected by expected information gain, not AI generation.
      </p>
    </div>
  );
}
