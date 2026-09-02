import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import Link from "next/link";

const SAFETY_TIERS = [
  {
    tier: "LOW",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    experiments: [
      { name: "Magnet Test", note: "Keep magnet away from phones, cards, and medical devices." },
      { name: "Water Float / Density", note: "Do over a tray. Dry sample after. Do not drink the water." },
      { name: "Conductivity Check", note: "Low-voltage battery circuit only (≤3 V). Do not use mains power." },
    ],
  },
  {
    tier: "MEDIUM",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    experiments: [
      { name: "Vinegar Reaction", note: "Adult supervision required. Wear safety glasses. Rinse if splashed. Do not mix with other chemicals." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />
      <main className="flex-grow max-w-[800px] mx-auto px-4 md:px-10 py-10 w-full flex flex-col gap-10">

        <div>
          <h1
            className="font-bold text-[36px] md:text-[48px] -rotate-1 text-primary"
            style={{ fontFamily: "var(--font-quicksand)" }}
          >
            Safety Guide
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-lg leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
            All experiments in this kit are physical and observational only — no heat, flame, or combining unknowns. This page explains what each experiment involves and when adult supervision is needed.
          </p>
        </div>

        {/* Experiment Safety Tiers */}
        {SAFETY_TIERS.map((tier) => (
          <section key={tier.tier} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 border-2 rounded-full text-sm font-bold ${tier.color}`}>
                {tier.tier} SAFETY
              </span>
              {tier.tier === "LOW" && (
                <span className="text-sm text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                  Children can perform these alone
                </span>
              )}
              {tier.tier === "MEDIUM" && (
                <span className="text-sm text-amber-700 font-bold" style={{ fontFamily: "var(--font-nunito)" }}>
                  Adult supervision required
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {tier.experiments.map((exp) => (
                <div
                  key={exp.name}
                  className="sketch-border bg-white p-5 flex flex-col gap-1"
                >
                  <h3 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
                    {exp.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
                    {exp.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* The two hard rules */}
        <section className="sketch-border bg-white p-6 flex flex-col gap-4">
          <h2 className="font-bold text-xl" style={{ fontFamily: "var(--font-quicksand)" }}>
            How the AI stays safe
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">lock</span>
              <div>
                <p className="font-bold text-sm" style={{ fontFamily: "var(--font-nunito)" }}>The AI never invents experiments</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  It only selects from the pre-approved, human-written list above. Every experiment has fixed instructions, fixed warnings, and a fixed safety tier. The AI cannot add steps or modify safety text.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">rule</span>
              <div>
                <p className="font-bold text-sm" style={{ fontFamily: "var(--font-nunito)" }}>Results are multiple-choice only</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  You report what you observed using pre-written options — no free text, no photo interpretation mid-loop. This keeps the confidence scores honest and prevents the AI from guessing based on ambiguous descriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Honest Scope */}
        <section className="border border-outline-variant rounded-xl p-5 flex flex-col gap-2">
          <h2 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
            What this prototype can and can&apos;t do
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
            This prototype identifies among <strong>6 safe, non-toxic, non-reactive reference elements</strong>: iron, copper, zinc, aluminum, sulfur, and graphite. If a sample doesn&apos;t match any of these, it is classified as <strong>Unknown</strong>. The system does not claim to identify arbitrary materials — that would require a much larger, trained classifier.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
            Samples in the kit contain no explosives or reactive substances. Experiments are strictly physical and observational. This design is aligned with children&apos;s chemistry kit safety expectations (EN 71-4 style).
          </p>
        </section>

        {/* Privacy note */}
        <section className="border border-outline-variant rounded-xl p-5 flex flex-col gap-2">
          <h2 className="font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
            Privacy
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: "var(--font-nunito)" }}>
            Photos you upload are sent to the on-premise Ollama vision model and are not stored after the response. No personal data is collected. Investigation state is stored locally in your browser session and is cleared when you close the tab.
          </p>
        </section>

        <Link
          href="/lab"
          className="self-start px-6 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow font-bold hover:-translate-y-1 transition-transform"
          style={{ fontFamily: "var(--font-quicksand)" }}
        >
          Return to Lab →
        </Link>

      </main>
      <StitchFooter />
    </div>
  );
}
