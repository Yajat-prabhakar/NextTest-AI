"use client";

import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import Link from "next/link";
import { useLabContext } from "@/lib/store";
import { ELEMENT_LABELS, ELEMENT_COLORS } from "@/lib/constants";
import type { ElementId } from "@/lib/constants";
import { EvidenceLog } from "@/components/EvidenceLog";
import { useState } from "react";

const ELEMENT_FACTS: Record<ElementId, string> = {
  iron: "Iron makes up most of the Earth's core and is the most-used metal in history. Its magnetic property is what separates it from almost every other kit element in one quick test.",
  copper: "Copper was one of the first metals ever used by humans — over 10,000 years ago. Its distinctive reddish color and excellent conductivity make it unmistakable in the kit.",
  zinc: "Zinc is used to coat iron and steel to prevent rusting — a process called galvanization. It has a slightly bluish-white luster and is denser than aluminum.",
  aluminum: "Aluminum is remarkably light and non-magnetic. Despite being the most abundant metal in Earth's crust, it was once more valuable than gold.",
  sulfur: "Sulfur is one of the few non-metallic elements in the kit — it's bright yellow and non-conductive, which means it rules itself out on almost every electrical test.",
  graphite: "Graphite is pure carbon arranged in layers, making it both a good lubricant and a reasonable electrical conductor — unusual for a non-metal.",
  unknown: "This sample didn't match any of the 6 kit elements. In a real lab, identifying it would require mass spectrometry or X-ray diffraction.",
};

// Map each element to which sample IDs might have solved it
function findSolvedSample(
  samples: ReturnType<typeof useLabContext>["samples"],
  elementId: string
): string | null {
  for (const [sampleId, state] of Object.entries(samples)) {
    if (state.status === "solved" && state.identifiedElementId === elementId) {
      return sampleId;
    }
  }
  return null;
}

const DISPLAY_ELEMENTS: ElementId[] = ["iron", "copper", "zinc", "aluminum", "sulfur", "graphite"];

export default function CollectionPage() {
  const { samples } = useLabContext();
  const solvedCount = DISPLAY_ELEMENTS.filter(
    (el) => !!findSolvedSample(samples, el)
  ).length;

  const [expanded, setExpanded] = useState<ElementId | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />
      <main className="flex-grow max-w-[1280px] mx-auto px-4 md:px-10 py-8 w-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-on-surface border-dashed pb-4 mb-8">
          <div>
            <h1
              className="font-bold text-[36px] md:text-[48px] -rotate-1 text-primary"
              style={{ fontFamily: "var(--font-quicksand)" }}
            >
              My Collection
            </h1>
            <p className="text-on-surface-variant mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
              {solvedCount} / {DISPLAY_ELEMENTS.length} elements identified
            </p>
          </div>
          {solvedCount === DISPLAY_ELEMENTS.length && (
            <div className="sketch-border bg-secondary-container px-5 py-2 -rotate-1 ink-shadow-sm text-sm font-bold">
              🏆 Full collection complete!
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DISPLAY_ELEMENTS.map((elementId) => {
            const solvedBySample = findSolvedSample(samples, elementId);
            const isSolved = !!solvedBySample;
            const color = ELEMENT_COLORS[elementId];
            const label = ELEMENT_LABELS[elementId];
            const isExpanded = expanded === elementId;
            const sampleState = solvedBySample ? samples[solvedBySample] : null;

            return (
              <div
                key={elementId}
                className={`sketch-border p-6 flex flex-col gap-4 transition-all ${
                  isSolved
                    ? "bg-white ink-shadow hover:-translate-y-1 cursor-pointer"
                    : "bg-surface-container-lowest opacity-60"
                }`}
                style={isSolved ? { borderLeftWidth: 4, borderLeftColor: color } : {}}
                onClick={() => isSolved && setExpanded(isExpanded ? null : elementId)}
              >
                {/* Element icon */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-14 h-14 rounded-lg border-2 border-on-surface flex items-center justify-center text-2xl font-bold"
                    style={{ background: isSolved ? color + "22" : undefined }}
                  >
                    {isSolved ? (
                      <span style={{ color }}>{label.split(" ")[0][0]}</span>
                    ) : (
                      <span className="text-on-surface-variant text-lg">?</span>
                    )}
                  </div>
                  {isSolved && (
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container border border-outline-variant rounded-full text-xs font-bold -rotate-1">
                      Solved
                    </span>
                  )}
                </div>

                {/* Name + fact */}
                <div>
                  <h3
                    className="font-bold text-xl"
                    style={{ fontFamily: "var(--font-quicksand)", color: isSolved ? color : undefined }}
                  >
                    {isSolved ? label : "???"}
                  </h3>
                  {isSolved && solvedBySample && (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Identified via Sample #{solvedBySample}
                    </p>
                  )}
                  {isSolved && (
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
                      {ELEMENT_FACTS[elementId]}
                    </p>
                  )}
                  {!isSolved && (
                    <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
                      Identify this element in the lab to unlock this card.
                    </p>
                  )}
                </div>

                {/* Expanded reasoning trail */}
                {isExpanded && sampleState && sampleState.trail.length > 0 && (
                  <div className="border-t border-outline-variant pt-4 mt-2">
                    <EvidenceLog
                      trail={sampleState.trail}
                      whatExplanations={sampleState.whatExplanations}
                    />
                    <Link
                      href={`/lab/sample/${solvedBySample}`}
                      className="inline-block mt-3 text-sm font-bold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View full case file →
                    </Link>
                  </div>
                )}

                {isSolved && !isExpanded && (
                  <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors text-left mt-auto">
                    {sampleState?.trail?.length ? "Show reasoning trail ↓" : ""}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/lab"
            className="inline-block px-8 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow hover:-translate-y-1 transition-transform font-bold"
            style={{ fontFamily: "var(--font-quicksand)" }}
          >
            Back to Lab
          </Link>
        </div>
      </main>
      <StitchFooter />
    </div>
  );
}
