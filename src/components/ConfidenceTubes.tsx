"use client";

import { ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/constants";
import type { Distribution } from "@/lib/bayes";
import { sortedRealCandidates } from "@/lib/bayes";

interface ConfidenceTubesProps {
  distribution: Distribution;
  /** Compact mode — no heading, tighter spacing. Used in AnimatedPreview on Landing. */
  compact?: boolean;
}

export function ConfidenceTubes({ distribution, compact = false }: ConfidenceTubesProps) {
  const sorted = sortedRealCandidates(distribution);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className={compact ? "" : ""}>
      {/* Top 3 tubes */}
      <div className="flex justify-center gap-6 md:gap-10 items-end min-h-[180px]">
        {top3.map(({ id, confidence }, idx) => {
          const h = Math.max(8, Math.round(confidence * 100));
          const color = ELEMENT_COLORS[id as keyof typeof ELEMENT_COLORS] ?? "#6b38d4";
          const rotate = idx === 0 ? "rotate-1" : idx === 1 ? "-rotate-1" : "rotate-2";
          const isLeader = idx === 0;

          return (
            <div key={id} className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold" style={{ fontFamily: "var(--font-nunito)", color }}>
                {Math.round(confidence * 100)}%
              </span>
              <div
                className={`relative border-[3px] border-on-surface rounded-b-full rounded-t-lg bg-white overflow-hidden ${rotate} ${isLeader ? "w-16 h-40" : "w-12 h-32"}`}
                style={{ boxShadow: "3px 3px 0 #1a1c1c" }}
              >
                {/* Glare */}
                <div className="absolute top-2 left-1.5 w-1.5 h-16 bg-white/50 rounded-full z-10" />
                {/* Liquid fill */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                  style={{ height: `${h}%`, background: color }}
                />
              </div>
              <span
                className={`font-bold text-center leading-tight ${isLeader ? "text-sm text-on-surface" : "text-xs text-on-surface-variant"}`}
                style={{ fontFamily: "var(--font-quicksand)" }}
              >
                {ELEMENT_LABELS[id as keyof typeof ELEMENT_LABELS]?.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Remaining 4 as horizontal mini-bars — same card, no detached pill row */}
      {rest.length > 0 && (
        <div className="mt-5 space-y-1.5 border-t border-outline-variant pt-4">
          {rest.map(({ id, confidence }) => {
            const color = ELEMENT_COLORS[id as keyof typeof ELEMENT_COLORS] ?? "#6b38d4";
            const pct = Math.round(confidence * 100);
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-xs font-bold w-16 text-right text-on-surface-variant shrink-0" style={{ fontFamily: "var(--font-nunito)" }}>
                  {ELEMENT_LABELS[id as keyof typeof ELEMENT_LABELS]?.split(" ")[0]}
                </span>
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, pct)}%`, background: color }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
