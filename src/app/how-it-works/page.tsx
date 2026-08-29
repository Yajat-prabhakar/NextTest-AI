import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />
      <main className="flex-grow max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col gap-8 w-full">
        <h1 className="font-bold text-[36px] md:text-[48px] -rotate-1 text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
          How It Works
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Photo your sample", icon: "photo_camera", desc: "Place the mystery material on a plain background in good light. The vision LLM (qwen2.5vl:3b) gives a rough first impression — not a guaranteed classifier — as a 7-way distribution across iron, copper, zinc, aluminum, sulfur, graphite, unknown." },
            { step: "2", title: "Adaptive AI Reasoning", icon: "science", desc: "If below 85% threshold, we pick the next experiment by expected information gain (deterministic, hand-authored likelihoods P(result|element)). The text LLM only explains why — it never does math." },
            { step: "3", title: "Test & Update", icon: "biotech", desc: "Perform the magnet, float, vinegar, or conductivity test. Report via multiple choice. We update by Naive Bayes: posterior ∝ prior × likelihood, then re-rank. Loop until confident or unknown wins." },
          ].map((c) => (
            <div key={c.step} className="sketch-border bg-white p-6 ink-shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary border-2 border-on-surface flex items-center justify-center font-bold text-lg -rotate-3">
                {c.step}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{c.icon}</span>
                <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-quicksand)" }}>
                  {c.title}
                </h3>
              </div>
              <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="sketch-border bg-secondary-container p-6">
          <h3 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
            Experiment menu (fixed, pre-approved)
          </h3>
          <ul className="list-disc pl-5 mt-2 text-sm" style={{ fontFamily: "var(--font-nunito)" }}>
            <li>Magnet Test — low safety, is it attracted?</li>
            <li>Water Float/Density — low, sinks vs floats</li>
            <li>Vinegar Reaction — medium, vigorous/slight/no fizz</li>
            <li>Conductivity — low, LED on/off</li>
          </ul>
          <p className="text-xs mt-2 text-on-surface-variant">AI only selects an ID — never generates instructions or warnings live.</p>
        </div>
        <Link href="/lab" className="self-start px-6 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow font-bold hover:-translate-y-1 transition-transform">
          Start Investigation →
        </Link>
      </main>
      <StitchFooter />
    </div>
  );
}
