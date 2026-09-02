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
        <p className="text-lg text-on-surface-variant -mt-4 max-w-3xl" style={{ fontFamily: "var(--font-nunito)" }}>
          Most science kits give every kid the same steps in the same order. <span className="font-bold text-on-surface">We built a kit where the AI decides what you try next, based on what it&apos;s still unsure about — and explains why.</span> The student learns to investigate, not just to follow instructions.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Photo → real confidence", icon: "photo_camera", desc: "Place the mystery material on a plain background in good light. The vision LLM (qwen2.5vl:3b) gives a rough first impression — not a guaranteed classifier — as a genuine 7-way distribution across iron, copper, zinc, aluminum, sulfur, graphite, unknown. Honest about blurry/ambiguous shots." },
            { step: "2", title: "AI picks what it's unsure about", icon: "science", desc: "If below threshold (default 85%, adjustable), we pick the next experiment by expected information gain — deterministic, hand-authored likelihoods P(result|element). The text LLM only explains why in kid-friendly language — it never does math or authors steps." },
            { step: "3", title: "You test, we update", icon: "biotech", desc: "Perform the magnet, float, vinegar, or conductivity test — alone or with adult help for anything above the lowest safety tier — and report via multiple-choice only. We update by Naive Bayes: posterior ∝ prior × likelihood, then re-rank. Loop until confident or Unknown wins." },
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
            Experiment menu — fixed, pre-approved, safety-rated (AI selects ID only)
          </h3>
          <ul className="list-disc pl-5 mt-2 text-sm space-y-1" style={{ fontFamily: "var(--font-nunito)" }}>
            <li><span className="font-bold">Magnet Test</span> — <span className="px-1.5 py-0.5 bg-emerald-100 border rounded text-xs font-bold">LOW</span> — is it attracted? Keep magnet away from phones/cards/medical devices.</li>
            <li><span className="font-bold">Water Float / Density</span> — <span className="px-1.5 py-0.5 bg-emerald-100 border rounded text-xs font-bold">LOW</span> — sinks vs floats. Do over a tray, dry sample after, do not drink water.</li>
            <li><span className="font-bold">Vinegar Reaction</span> — <span className="px-1.5 py-0.5 bg-amber-100 border rounded text-xs font-bold">MEDIUM · Adult supervision recommended</span> — vigorous / slight / no fizz. Wear safety glasses, rinse if splashed, do not mix with other chemicals.</li>
            <li><span className="font-bold">Conductivity</span> — <span className="px-1.5 py-0.5 bg-emerald-100 border rounded text-xs font-bold">LOW</span> — LED on/off. Low-voltage battery circuit only (≤3 V), do not use mains.</li>
          </ul>
          <p className="text-xs mt-3 font-bold">Two architectural rules that must not be broken:</p>
          <ol className="list-decimal pl-5 text-xs mt-1 space-y-1 text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
            <li><span className="font-bold">AI never generates a new experiment or safety instruction on the fly.</span> It only picks from this human-vetted, pre-written menu, each entry tagged with a safety tier and fixed warning text. Hallucination here could cause real harm.</li>
            <li><span className="font-bold">AI never interprets free-form results.</span> Reporting is structured/multiple-choice only — keeping confidence honest instead of reintroducing the open-world guessing problem.</li>
          </ol>
        </div>

        <div className="sketch-border bg-amber-50 border-amber-200 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700" style={{ fontSize: 24 }}>verified_user</span>
            <h3 className="font-bold text-amber-900" style={{ fontFamily: "var(--font-quicksand)" }}>Regulatory &amp; Safety Compliance</h3>
          </div>
          <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1" style={{ fontFamily: "var(--font-nunito)" }}>
            <li>Samples are <span className="font-bold">safe, non-toxic, non-reactive reference elements only</span> — no explosives, no reactive substances. No heat, flame, or combining unknowns. Physical/observational tests only (magnetism, density, mild vinegar indicator, conductivity).</li>
            <li>Aligned with kids&apos; chemistry kit expectations (e.g. EN 71-4 style safety). Stopping threshold defaults to 85% (adjustable 60–95% in the Lab) — controls how many rounds a demo takes.</li>
            <li>For medium-tier steps, the UI shows <span className="font-bold">Adult supervision recommended</span> and the child can do low-tier tests alone.</li>
            <li>Confidence scores are <span className="font-bold">real and closed-set</span> — not fabricated percentages — because the candidate set is small and known in advance (Bayesian update with hand-estimated likelihoods P(result|element)).</li>
          </ul>
          <p className="text-xs text-amber-800" style={{ fontFamily: "var(--font-nunito)" }}>
            Honest scope: For this prototype we support 6 reference elements + Unknown. The same evidence-driven loop generalizes to more samples later — we say the narrower, defensible claim rather than &quot;general element detection.&quot;
          </p>
        </div>
        <Link href="/lab" className="self-start px-6 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow font-bold hover:-translate-y-1 transition-transform">
          Start Investigation →
        </Link>
      </main>
      <StitchFooter />
    </div>
  );
}
