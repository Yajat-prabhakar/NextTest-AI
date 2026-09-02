"use client";

import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import Link from "next/link";
import { useLabContext } from "@/lib/store";
import { ELEMENT_LABELS } from "@/lib/constants";

export default function CollectionPage() {
  const { samples } = useLabContext();
  const sampleIds = Object.keys(samples);
  const solvedSamples = sampleIds.filter(id => samples[id].status === "solved");
  
  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />
      <main className="flex-grow max-w-[1280px] mx-auto px-4 md:px-10 py-8 w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-on-surface border-dashed pb-4">
          <div>
            <h1 className="font-bold text-[32px] md:text-[48px] -rotate-1 text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
              My Collection
            </h1>
            <p className="text-on-surface-variant mt-2 font-bold" style={{ fontFamily: "var(--font-nunito)" }}>
              {solvedSamples.length} / {sampleIds.length} Elements Identified
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {sampleIds.map((id) => {
            const state = samples[id];
            const isSolved = state.status === "solved";
            const elementId = state.identifiedElementId || "unknown";
            const label = ELEMENT_LABELS[elementId as keyof typeof ELEMENT_LABELS] || elementId;

            return (
              <div key={id} className={`sketch-border bg-white p-6 ink-shadow-sm ${isSolved ? '' : 'opacity-70 bg-surface-container-lowest grayscale'}`}>
                <div className={`h-32 rounded-lg border-2 border-on-surface flex items-center justify-center ${isSolved ? 'bg-secondary-container' : 'bg-surface-container border-dashed'}`}>
                  {isSolved ? (
                    <span className="text-4xl font-bold">{elementId === "unknown" ? "❓" : "✓"}</span>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-4xl">science</span>
                  )}
                </div>
                <h3 className="font-bold mt-3 text-xl" style={{ fontFamily: "var(--font-quicksand)" }}>
                  {isSolved ? label : `Mystery Sample #${id}`}
                </h3>
                <p className="text-sm text-on-surface-variant font-bold mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                  {isSolved && state.dateSolved 
                    ? `Solved on ${new Date(state.dateSolved).toLocaleDateString()}` 
                    : "Identify in the lab to unlock this card."}
                </p>
                
                {isSolved && (
                   <Link href={`/lab/sample/${id}/result`} className="inline-block mt-4 text-sm font-bold text-primary underline">
                     Review Case File →
                   </Link>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/lab" className="inline-block px-8 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow hover:-translate-y-1 transition-transform font-bold">
            Return to Lab
          </Link>
        </div>
      </main>
      <StitchFooter />
    </div>
  );
}
