"use client";

import type { EvidenceEntry } from "@/lib/bayes";
import type { ExplanationPair } from "@/lib/explanations";

interface EvidenceLogProps {
  trail: EvidenceEntry[];
  /** Keyed by round number — explanation of what each result means, shown inline */
  whatExplanations?: Record<number, ExplanationPair>;
}

export function EvidenceLog({ trail, whatExplanations }: EvidenceLogProps) {
  if (trail.length === 0) return null;

  return (
    <div className="sketch-border bg-white p-4 -rotate-[0.3deg]">
      <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-quicksand)" }}>
        Reasoning Trail
      </h3>
      <ol className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
        {trail.map((e, idx) => {
          const isLatest = idx === trail.length - 1;
          const explanation = whatExplanations?.[e.round];

          return (
            <li
              key={`${e.round}-${e.experimentId}`}
              className={`ml-10 relative before:absolute before:-left-[2.15rem] before:top-3 before:w-3 before:h-3 before:rounded-full before:border-2 before:border-on-surface before:bg-white ${isLatest ? "before:bg-primary before:border-primary" : ""}`}
            >
              <div className={`border-2 rounded-lg p-3 ${isLatest ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-lowest"}`}>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <span>Step {e.round}</span>
                  <span className="bg-white px-2 border border-outline-variant rounded-full font-mono lowercase normal-case tracking-normal">{e.experimentId}</span>
                </div>
                <p className="font-bold mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                  {e.experimentName}
                </p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Result: <span className="font-semibold text-on-surface">{e.chosenLabel}</span>
                </p>
                {explanation && (
                  <p className="text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline-variant leading-relaxed italic">
                    {explanation.main}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
