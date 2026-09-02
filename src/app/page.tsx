import Link from "next/link";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import { AnimatedPreview } from "@/components/AnimatedPreview";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />

      {/* Hero - from Welcome to the Lab */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col gap-16">
        <section className="grid md:grid-cols-2 gap-8 items-center py-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container border-2 border-on-surface rounded-full -rotate-1 w-fit">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                star
              </span>
              <span className="font-bold text-sm" style={{ fontFamily: "var(--font-nunito)" }}>
                Adaptive Sequence — Not a Fixed Script
              </span>
            </div>
            <h1
              className="font-bold text-[40px] md:text-[56px] leading-[1.05] tracking-tight -rotate-1"
              style={{ fontFamily: "var(--font-quicksand)" }}
            >
              Most kits give every kid the <span className="text-primary sketchy-underline">same steps.</span> Ours doesn&apos;t.
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
              <span className="font-bold text-on-surface">We built a kit where the AI decides what you try next — based on what it&apos;s still unsure about — and explains why.</span> You learn to investigate, not just follow instructions.
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed border-l-4 border-primary pl-3" style={{ fontFamily: "var(--font-nunito)" }}>
              Photograph your mystery sample → see a <em>real</em> closed-set confidence split across our 6 safe reference elements + Unknown → AI picks the most informative next test from a pre-approved, safety-rated menu → you report the result (multiple-choice only) → confidence updates by Bayes. No heat, no flame, no combining unknowns.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/lab"
                className="px-8 py-3 bg-primary text-on-primary font-bold text-lg border-[3px] border-on-surface rounded-xl ink-shadow hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#1a1c1c] active:translate-y-0 active:translate-x-0 transition-all inline-flex items-center gap-2"
                style={{ fontFamily: "var(--font-quicksand)" }}
              >
                Start Investigation
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/help"
                className="px-6 py-3 bg-white border-2 border-on-surface rounded-xl ink-shadow-sm font-bold hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <span className="material-symbols-outlined">help</span> How it works
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse" /> Validation prototype — 6 safe elements + Unknown · requires network access to Ollama
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed bg-white border border-dashed border-outline-variant rounded-lg px-3 py-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <span className="font-bold">Honest scope:</span> For this prototype we distinguish among 6 safe, non-toxic, non-reactive reference elements (iron, copper, zinc, aluminum, sulfur, graphite) + Unknown. Samples contain no explosives or reactive substances. Experiments are physical/observational only. Same evidence-driven loop generalizes to more samples later.
            </p>
          </div>

          <div className="relative">
            <div className="sketch-border ink-shadow bg-surface-container-lowest p-2 rotate-1">
              <div className="aspect-[4/3] bg-surface-container-high rounded-lg overflow-hidden relative">
                <AnimatedPreview />
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-secondary border-2 border-on-surface rounded-full font-bold text-xs -rotate-3 z-10">
                  6 safe elements + Unknown
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-tertiary-container border-2 border-on-surface rounded-lg -rotate-2 text-sm font-bold ink-shadow-sm hidden md:block">
              Bayesian · Zero-shot vision
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section>
          <h2
            className="text-center font-bold text-[32px] md:text-[40px] mb-8 -rotate-1"
            style={{ fontFamily: "var(--font-quicksand)" }}
          >
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "1",
                icon: "photo_camera",
                title: "Photo → real confidence",
                desc: "Snap a pic on a plain background. Zero-shot vision (qwen2.5vl:3b) returns a genuine 7-way split — honest about uncertainty, with an Unknown bucket for blurry/ambiguous shots.",
                color: "bg-primary text-on-primary",
              },
              {
                n: "2",
                icon: "science",
                title: "AI picks what it's unsure about",
                desc: "If below threshold, we choose the next test by expected information gain — deterministic Bayesian reasoning. Text AI only explains why (e.g. “can't tell copper from iron yet — a magnet will settle it”).",
                color: "bg-secondary text-on-secondary",
              },
              {
                n: "3",
                icon: "search_check",
                title: "You test, we update",
                desc: "Perform the magnet, float, vinegar, or conductivity test alone or with adult help (medium tier). Report via multiple-choice only — confidence updates by Naive Bayes until confident or Unknown wins.",
                color: "bg-tertiary-container text-on-tertiary-container",
              },
            ].map((s) => (
              <div key={s.n} className="sketch-border bg-white p-6 flex flex-col gap-3 ink-shadow-sm hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-full border-2 border-on-surface flex items-center justify-center font-bold ${s.color}`}>{s.n}</span>
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-quicksand)" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety + regulatory compliance — required for kids chemistry demo */}
        <section className="sketch-border bg-amber-50 border-amber-200 p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700" style={{ fontSize: 28 }}>
              verified_user
            </span>
            <h3 className="font-bold text-amber-900" style={{ fontFamily: "var(--font-quicksand)" }}>
              Safety &amp; Regulatory Compliance
            </h3>
          </div>
          <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1" style={{ fontFamily: "var(--font-nunito)" }}>
            <li><span className="font-bold">Samples are safe, non-toxic, non-reactive reference elements only</span> — no explosives, no reactive substances, no heat/flame, no combining unknowns.</li>
            <li>Experiments are physical/observational only: magnetism, density/float, mild vinegar indicator, low-voltage (≤3 V) conductivity — aligned with kids&apos; chemistry kit expectations (EN 71-4 style safety).</li>
            <li><span className="font-bold">AI never authors experiments.</span> It only selects an ID from a human-vetted, pre-written menu; each entry has fixed instructions, fixed warnings, and a safety tier. Open generation here is blocked by design.</li>
            <li>Results are <span className="font-bold">multiple-choice only</span> — no free-text/photo interpretation in the loop, keeping confidence honest.</li>
            <li>Medium-tier Vinegar test: <span className="font-bold">adult supervision recommended</span> — wear safety glasses, rinse if splashed, do not mix with other chemicals.</li>
          </ul>
          <p className="text-xs text-amber-800 mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
            This is a validation prototype testing whether a zero-shot vision LLM (<code className="bg-white px-1 border">qwen2.5vl:3b</code>) is good enough to seed a deterministic Bayesian loop — or whether a trained closed-set classifier is needed later. The loop itself is offline-capable and never lets the AI invent steps.
          </p>
        </section>

        {/* Demo loop preview — for judges */}
        <section className="sketch-border bg-white p-6 flex flex-col gap-3">
          <h3 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
            Live demo loop (what you&apos;ll see on stage)
          </h3>
          <ol className="list-decimal pl-5 text-sm text-on-surface-variant space-y-1" style={{ fontFamily: "var(--font-nunito)" }}>
            <li>Photograph a sample → show initial real confidence split.</li>
            <li>AI explains why it&apos;s still uncertain and requests a specific test.</li>
            <li>Perform the test, report the multiple-choice result.</li>
            <li>Show confidence updating in real time.</li>
            <li>Reach a conclusion + show the evidence trail — <em>here&apos;s why we asked for each test.</em></li>
          </ol>
        </section>
      </main>

      <StitchFooter />
    </div>
  );
}
