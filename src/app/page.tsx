import Link from "next/link";
import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";

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
                New: Adaptive AI Mentor
              </span>
            </div>
            <h1
              className="font-bold text-[40px] md:text-[56px] leading-[1.05] tracking-tight -rotate-1"
              style={{ fontFamily: "var(--font-quicksand)" }}
            >
              Uncover the <span className="text-primary sketchy-underline">Secrets of Matter!</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
              Use your real STEM kit and our <span className="font-bold">Adaptive AI Mentor</span> to identify mystery elements.
              Unlike a fixed script, our AI analyzes uncertainty in real-time to decide the next experiment and explains
              exactly <em>why</em> each test is needed to solve the case!
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
                href="/how-it-works"
                className="px-6 py-3 bg-white border-2 border-on-surface rounded-xl ink-shadow-sm font-bold hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <span className="material-symbols-outlined">help</span> How it works
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse" /> Validation prototype — requires network access to Ollama
            </div>
          </div>

          <div className="relative">
            <div className="sketch-border ink-shadow bg-surface-container-lowest p-2 rotate-1">
              <div className="aspect-[4/3] bg-surface-container-high rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant m-4 rounded-lg bg-white/80">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 48 }}>
                    science
                  </span>
                  <span className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
                    LIVE LAB FEED
                  </span>
                  <span className="text-sm text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                    Camera preview appears here in the Lab
                  </span>
                  <Link
                    href="/lab"
                    className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-full font-bold text-sm border-2 border-on-surface"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Open Lab →
                  </Link>
                </div>
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-secondary border-2 border-on-surface rounded-full font-bold text-xs -rotate-3">
                  6 elements + Unknown
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
                title: "Photo your sample",
                desc: "Snap a quick pic of the mystery material from your kit.",
                color: "bg-primary text-on-primary",
              },
              {
                n: "2",
                icon: "science",
                title: "Adaptive AI Reasoning",
                desc: "Based on what it doesn't know yet, the AI calculates the most informative next step and explains the logic behind every suggestion.",
                color: "bg-secondary text-on-secondary",
              },
              {
                n: "3",
                icon: "search_check",
                title: "Solve the mystery!",
                desc: "Log your results, earn badges, and uncover the element's identity.",
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

        {/* Prototype note */}
        <section className="sketch-border bg-primary-fixed/40 p-6 flex flex-col md:flex-row gap-4 items-start">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>
            info
          </span>
          <div>
            <h3 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
              Validation prototype — what we&apos;re testing
            </h3>
            <p className="text-sm text-on-surface-variant mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
              Whether the zero-shot vision LLM&apos;s rough guess (<code className="bg-white px-1 border">qwen2.5vl:3b</code>) is good enough to seed the Bayesian loop — or whether
              we&apos;ll need the trained closed-set classifier later. The loop itself is deterministic, offline-capable, and never lets the AI invent experiments.
            </p>
          </div>
        </section>
      </main>

      <StitchFooter />
    </div>
  );
}
