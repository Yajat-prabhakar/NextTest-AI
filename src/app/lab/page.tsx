"use client";

import Link from "next/link";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import { useLabContext } from "@/lib/store";
import { ELEMENT_LABELS } from "@/lib/constants";

export default function LabSelectionPage() {
  const { samples } = useLabContext();
  
  const sampleIds = ["1", "2", "3", "4", "5", "6"];
  const solvedCount = Object.values(samples).filter(s => s.status === "solved").length;

  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-on-surface border-dashed pb-3">
          <div>
            <h1 className="font-bold text-[32px] md:text-[48px] text-primary -rotate-1 inline-block" style={{ fontFamily: "var(--font-quicksand)" }}>
              Choose a Mystery Sample
            </h1>
            <p className="text-sm text-on-surface-variant mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
              Select an unknown sample from your kit to begin the investigation.
            </p>
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="material-symbols-outlined text-secondary">science</span>
            <span>{solvedCount}/6 elements identified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {sampleIds.map((id, index) => {
            const state = samples[id];
            const isLocked = index > 0 && samples[sampleIds[index - 1]].status !== "solved";
            
            return (
              <div key={id} className={`sketch-border p-6 flex flex-col gap-4 ink-shadow-sm transition-transform ${isLocked ? 'bg-surface-container-lowest opacity-75 grayscale' : 'bg-white hover:-translate-y-1'}`}>
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high border-2 border-on-surface flex items-center justify-center text-2xl font-bold">
                    {state.status === "solved" ? "✓" : "?"}
                  </div>
                  {state.status === "solved" && (
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container border-2 border-on-surface rounded-full text-xs font-bold -rotate-2">
                      Solved
                    </span>
                  )}
                  {state.status === "in_progress" && (
                    <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container border-2 border-on-surface rounded-full text-xs font-bold rotate-1">
                      In Progress
                    </span>
                  )}
                  {state.status === "new" && !isLocked && (
                    <span className="px-2 py-1 bg-primary text-on-primary border-2 border-on-surface rounded-full text-xs font-bold rotate-2">
                      New
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-quicksand)" }}>
                    Sample #{id}
                  </h3>
                  {state.status === "solved" && state.identifiedElementId && (
                    <p className="text-sm font-bold text-secondary mt-1">
                      {ELEMENT_LABELS[state.identifiedElementId as keyof typeof ELEMENT_LABELS] || state.identifiedElementId}
                    </p>
                  )}
                </div>
                
                <div className="mt-2">
                  {isLocked ? (
                    <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
                      <span className="material-symbols-outlined text-lg">lock</span>
                      Solve Sample #{sampleIds[index - 1]} to unlock
                    </div>
                  ) : (
                    <Link
                      href={state.status === "solved" ? `/lab/sample/${id}/result` : `/lab/sample/${id}`}
                      className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-white border-2 border-on-surface rounded-xl font-bold hover:bg-surface-container-low transition-colors"
                    >
                      {state.status === "solved" ? "View Case File" : state.status === "in_progress" ? "Continue Investigation" : "Start Investigation"}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}
