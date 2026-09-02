"use client";

import type { EvidenceEntry } from "@/lib/bayes";

export function EvidenceLog({ trail }: { trail: EvidenceEntry[] }) {
  if (trail.length === 0) return null;

  return (
    <div className="sketch-border bg-white p-4">
      <h3 className="font-bold mb-3" style={{ fontFamily: "var(--font-quicksand)" }}>
        Reasoning Trail
      </h3>
      <ol className="space-y-3">
        {trail.map((e, idx) => {
          const isLatest = idx === trail.length - 1;
          
          return (
            <li key={`${e.round}-${e.experimentId}`} className={`border-2 border-outline-variant rounded-lg p-3 ${isLatest ? 'bg-surface-container-low' : 'bg-surface-container-lowest opacity-75'}`}>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>Step {e.round}</span>
                <span className="bg-white px-2 border rounded-full font-mono">{e.experimentId}</span>
              </div>
              <p className="font-semibold mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                {e.experimentName} → {e.chosenLabel}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
