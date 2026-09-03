"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import { EvidenceLog } from "@/components/EvidenceLog";
import { useLabContext } from "@/lib/store";
import { ELEMENT_LABELS } from "@/lib/constants";
import { getTopCandidate } from "@/lib/bayes";

const FUN_FACTS: Record<string, string> = {
  iron: "Iron makes up a huge part of the Earth's core! It's magnetic and rusts when exposed to oxygen and water.",
  copper: "Copper was one of the first metals ever extracted and used by humans. It's famous for conducting electricity really well.",
  zinc: "Zinc is often used to coat other metals (like iron) to stop them from rusting. This is called galvanization!",
  aluminum: "Aluminum is super light and strong. It's used in everything from soda cans to airplanes.",
  sulfur: "Sulfur is bright yellow and can smell like rotten eggs when it forms certain compounds, but pure sulfur has no smell!",
  graphite: "Graphite is made of pure carbon, just like diamonds! The difference is in how the atoms are arranged.",
  unknown: "Even after all those tests, the evidence was spread across a few candidates. The AI gave its best guess above — but in a real lab, we'd use advanced machines like a spectrometer to be completely sure!",
};

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { samples } = useLabContext();
  const state = samples[id];

  if (!state || state.status !== "solved") {
    // If we land here but it's not solved, send them back to the lab selection
    router.replace("/lab");
    return null;
  }

  const elementId = state.identifiedElementId || "unknown";
  const elementLabel = ELEMENT_LABELS[elementId as keyof typeof ELEMENT_LABELS] || elementId;
  const isUnknown = elementId === "unknown";

  // Pull the actual confidence from the final distribution (real-elements-only argmax)
  const finalConfidence = state.distribution
    ? getTopCandidate(state.distribution).confidence
    : null;
  const confidencePct = finalConfidence !== null
    ? Math.round(finalConfidence * 100)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />

      <main className="flex-grow w-full max-w-[800px] mx-auto px-4 md:px-10 py-10 flex flex-col gap-8">
        
        <div className="text-center">
          <div className={`mx-auto w-20 h-20 border-4 border-on-surface rounded-full flex items-center justify-center text-4xl mb-4 ${isUnknown ? 'bg-tertiary-container' : 'bg-secondary-container'}`}>
            {isUnknown ? '❓' : '✓'}
          </div>
          <h1 className="font-bold text-[32px] md:text-[48px] text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
            {isUnknown ? "Best Guess: Uncertain" : `Element Identified: ${elementLabel}`}
          </h1>
          {confidencePct !== null && (
            <p className="text-on-surface-variant font-bold mt-1 text-lg" style={{ fontFamily: "var(--font-nunito)" }}>
              {confidencePct}% confident
            </p>
          )}
          <p className="text-on-surface-variant font-bold mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
            Sample #{id} Case Closed
          </p>
        </div>


        <div className="sketch-border bg-white p-6 ink-shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-3xl">lightbulb</span>
            <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-quicksand)" }}>Did You Know?</h3>
          </div>
          <p className="text-on-surface-variant leading-relaxed font-bold" style={{ fontFamily: "var(--font-nunito)" }}>
            {FUN_FACTS[elementId] || "Science is all about investigating the unknown!"}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-2xl" style={{ fontFamily: "var(--font-quicksand)" }}>
            Reasoning Trail
          </h2>
          <p className="text-sm text-on-surface-variant -mt-2">
            Here&apos;s how we used evidence to narrow down the suspects.
          </p>
          <EvidenceLog trail={state.trail} whatExplanations={state.whatExplanations} />
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Link href="/collection" className="px-6 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow font-bold hover:-translate-y-1 transition-transform">
            View My Collection
          </Link>
          <Link href="/lab" className="px-6 py-3 bg-white border-2 border-on-surface rounded-xl font-bold hover:-translate-y-1 transition-transform">
            Identify New Sample
          </Link>
        </div>

      </main>
      
      <StitchFooter />
    </div>
  );
}
