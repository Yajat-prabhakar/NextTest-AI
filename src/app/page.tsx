import Link from "next/link";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import { AnimatedPreview } from "@/components/AnimatedPreview";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 flex flex-col gap-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-5">
            <h1
              className="font-bold text-[42px] md:text-[60px] leading-[1.02] tracking-tight -rotate-1"
              style={{ fontFamily: "var(--font-quicksand)" }}
            >
              Most kits give every kid the{" "}
              <span className="text-primary sketchy-underline">same steps.</span>
              <br />Ours doesn&apos;t.
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
              The AI decides what to try next based on what it&apos;s still unsure about — and explains why. You learn to{" "}
              <span className="font-bold text-on-surface">investigate</span>, not just follow instructions.
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
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
                className="px-6 py-3 bg-white border-2 border-on-surface rounded-xl font-bold hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2 text-on-surface-variant"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <span className="material-symbols-outlined text-[20px]">verified_user</span> Safety Guide
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
              Prototype · 6 safe, non-toxic reference elements + Unknown · no heat, flame, or combining unknowns
            </p>
          </div>

          {/* Animated confidence preview */}
          <div className="relative">
            <div className="sketch-border ink-shadow bg-surface-container-lowest p-2 rotate-1">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                <AnimatedPreview />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-secondary-container border-2 border-on-surface rounded-lg -rotate-2 text-sm font-bold ink-shadow-sm hidden md:block" style={{ fontFamily: "var(--font-quicksand)" }}>
              Bayesian · Zero-shot vision
            </div>
            <div className="absolute -top-3 -right-3 px-3 py-1 bg-primary text-on-primary border-2 border-on-surface rounded-full font-bold text-xs -rotate-3 z-10">
              6 elements + Unknown
            </div>
          </div>
        </section>

        {/* ── How it Works ─────────────────────────────────────────────── */}
        <section>
          <h2
            className="font-bold text-[30px] md:text-[38px] mb-8 -rotate-1"
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
                desc: "Snap a picture of the mystery sample. The AI gives a genuine 7-way probability split across all 6 elements + Unknown — honest about what it can't tell from a photo alone.",
                color: "bg-primary text-on-primary",
              },
              {
                n: "2",
                icon: "science",
                title: "AI picks what's still uncertain",
                desc: "If confidence is below the threshold, the AI selects the single experiment that would give it the most information — and tells you exactly why it needs that test.",
                color: "bg-secondary text-on-secondary",
              },
              {
                n: "3",
                icon: "search_check",
                title: "You test, confidence updates",
                desc: "Perform the magnet, float, vinegar, or conductivity test and report via multiple-choice. Confidence updates by Bayes — repeat until the answer is clear.",
                color: "bg-tertiary-container text-on-tertiary-container",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="sketch-border bg-white p-6 flex flex-col gap-3 ink-shadow-sm hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-full border-2 border-on-surface flex items-center justify-center font-bold text-base ${s.color}`}
                  >
                    {s.n}
                  </span>
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-quicksand)" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why it's different ───────────────────────────────────────── */}
        <section className="grid md:grid-cols-2 gap-8 items-start">
          <div className="sketch-border bg-white p-6 ink-shadow-sm rotate-[0.4deg]">
            <h3 className="font-bold text-xl mb-3" style={{ fontFamily: "var(--font-quicksand)" }}>
              The adaptive loop — not a fixed script
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
              Every other science kit sends every kid through the same checklist. Ours routes differently per kid, per sample — if you get an obvious copper photo, you might only need one experiment. If it&apos;s ambiguous, you&apos;ll run two or three. The AI&apos;s reasoning is transparent at every step.
            </p>
          </div>
          <div className="sketch-border bg-white p-6 ink-shadow-sm -rotate-[0.4deg]">
            <h3 className="font-bold text-xl mb-3" style={{ fontFamily: "var(--font-quicksand)" }}>
              Honest confidence scores
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
              The candidate set is small and closed — 6 known elements you own. That means the percentages are real Bayesian posteriors, not the fabricated-looking outputs that generic photo-to-material tools produce. Unknown is always a valid answer if nothing fits.
            </p>
          </div>
        </section>

      </main>

      <StitchFooter />
    </div>
  );
}
