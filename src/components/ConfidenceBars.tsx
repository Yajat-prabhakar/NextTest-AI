"use client";
import { motion } from "framer-motion";
import {
  ELEMENT_LABELS,
  ELEMENT_COLORS,
  type ElementId,
} from "@/lib/constants";
import type { Distribution } from "@/lib/bayes";
import { sortedCandidates } from "@/lib/bayes";

export function ConfidenceBars({
  distribution,
  label = "AI's first impression — zero-shot vision LLM",
}: {
  distribution: Distribution;
  label?: string;
}) {
  const sorted = sortedCandidates(distribution);
  const top = sorted[0];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </p>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          Rough guess · not guaranteed
        </span>
      </div>

      <div className="space-y-2.5">
        {sorted.map(({ id, confidence }) => {
          const isTop = id === top.id;
          const pct = Math.round(confidence * 1000) / 10; // one decimal
          return (
            <div key={id} className="group">
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`text-sm ${isTop ? "font-bold text-zinc-900 dark:text-white" : "font-medium text-zinc-600 dark:text-zinc-300"} ${id === "unknown" ? "italic" : ""}`}
                >
                  {ELEMENT_LABELS[id as ElementId]}
                  {isTop && (
                    <span className="ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-white dark:text-zinc-900">
                      Leading
                    </span>
                  )}
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-zinc-900 dark:text-white">
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      id === "unknown"
                        ? "repeating-linear-gradient(45deg, #8b5cf6 0 8px, #a78bfa 8px 16px)"
                        : ELEMENT_COLORS[id as ElementId],
                    opacity: isTop ? 1 : 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        Zero-shot — the vision model was never trained on this kit. Updated
        deterministically by experiments (Bayes), not by the AI.
      </p>
    </div>
  );
}
