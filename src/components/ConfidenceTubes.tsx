"use client";
import { ELEMENT_LABELS } from "@/lib/constants";
import type { Distribution } from "@/lib/bayes";
import { sortedCandidates } from "@/lib/bayes";

// Only show 3 tubes in the Stitch layout but we support all 7 filtered to top 3
export function ConfidenceTubes({ distribution }: { distribution: Distribution }) {
  const sorted = sortedCandidates(distribution);
  // Show top 3 for tube view + hint of others below
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const tubeColors: Record<string, string> = {
    iron: "#7b7486",
    copper: "#fcdf46",
    zinc: "#494454",
    aluminum: "#e8e8e7",
    sulfur: "#eab308",
    graphite: "#374151",
    unknown: "#8b5cf6",
  };

  return (
    <section className="mt-8">
      <h2
        className="text-center mb-6 -rotate-1 text-[24px] md:text-[32px] font-bold"
        style={{ fontFamily: "var(--font-quicksand)" }}
      >
        Confidence Tubes
      </h2>
      <div className="flex flex-wrap justify-center gap-8 md:gap-24 items-end min-h-[300px] p-6 bg-surface-container-low sketch-border ink-shadow">
        {top3.map(({ id, confidence }, idx) => {
          const h = Math.max(8, Math.round(confidence * 100));
          const isCopper = id === "copper";
          const width = isCopper ? "w-24 h-56" : "w-20 h-48";
          const rotate = idx === 0 ? "rotate-2" : idx === 1 ? "-rotate-1" : "rotate-1";
          return (
            <div key={id} className="flex flex-col items-center gap-2 group">
              <div
                className={`relative ${width} border-4 border-on-surface rounded-b-full rounded-t-lg bg-white overflow-hidden ink-shadow-sm flex items-end ${rotate}`}
              >
                <div className="absolute top-2 left-2 w-2 h-32 bg-white/50 rounded-full z-10" />
                <div
                  className={`w-full liquid-fill ${isCopper ? "text-secondary" : ""}`}
                  style={{
                    height: `${h}%`,
                    background: tubeColors[id] ?? "#6b38d4",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span
                    className="bg-white/90 px-2 py-1 border-2 border-on-surface font-bold text-sm rounded rotate-3 shadow-sm"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
              <span
                className={`font-semibold text-[18px] ${isCopper ? "text-secondary font-bold text-xl" : "text-on-surface-variant"}`}
                style={{ fontFamily: "var(--font-quicksand)" }}
              >
                {ELEMENT_LABELS[id as keyof typeof ELEMENT_LABELS].split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
      {rest.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {rest.map(({ id, confidence }) => (
            <span
              key={id}
              className="px-2 py-1 bg-white border-2 border-on-surface rounded-full text-xs font-bold"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {id}: {(confidence * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-xs text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
        AI&apos;s first impression — zero-shot vision LLM (qwen2.5vl:3b). Not a trained classifier. Updated deterministically by experiments.
      </p>
    </section>
  );
}
