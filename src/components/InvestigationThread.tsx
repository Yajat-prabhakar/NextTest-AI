"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Distribution, EvidenceEntry } from "@/lib/bayes";
import { getTopCandidate } from "@/lib/bayes";
import { ELEMENT_LABELS } from "@/lib/constants";
import type { Experiment } from "@/lib/experiments";
import type { ExplanationPair } from "@/lib/explanations";
import {
  buildFinalMessage,
  buildInitialRead,
  buildResultExplanation,
} from "@/lib/explanations";

// ── Empty-record sentinels ────────────────────────────────────────

const EMPTY_EXPLANATIONS: Record<number, ExplanationPair> = {};

// ── Fun-fact copy for the final card ─────────────────────────────

const FUN_FACTS: Record<string, string> = {
  iron: "Iron is magnetic and makes up a huge part of Earth's core.",
  copper: "Copper is famous for carrying electricity and for its reddish shine.",
  zinc: "Zinc often protects iron from rusting when it is used as a coating.",
  aluminum: "Aluminum is light enough for aircraft but strong enough for cans and foil.",
  sulfur: "Sulfur is a yellow non-metal that shows up in minerals and hot springs.",
  graphite: "Graphite is carbon arranged in slippery layers, which is why pencils work.",
  unknown: "The evidence did not match the kit cleanly, so a real lab would use stronger instruments next.",
};

// ── Message type ──────────────────────────────────────────────────

type Message =
  | {
      id: string;
      role: "ai";
      body: string;
      /** Raw algorithm output shown inside the "Show the numbers" disclosure.
       *  Absent on messages that have no statistical detail (initial read, final). */
      detail?: string;
      kind?: "normal" | "final";
    }
  | { id: string; role: "student"; body: string }
  | { id: string; role: "answer"; experiment: Experiment };

// ── Chat bubble ───────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const [showDetail, setShowDetail] = useState(false);

  if (message.role === "answer") return null;

  const isStudent = message.role === "student";
  const hasDetail = message.role === "ai" && Boolean(message.detail);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl border-2 border-on-surface p-4 text-sm leading-relaxed ink-shadow-sm ${
          isStudent ? "bg-primary text-on-primary rounded-br-md" : "bg-white text-on-surface rounded-bl-md"
        }`}
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {!isStudent && (
          <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
            <span className="material-symbols-outlined text-base">psychology</span>
            AI Investigator
          </div>
        )}
        <p>{message.body}</p>

        {/* "Show the numbers" disclosure — collapsed by default */}
        {hasDetail && (
          <div className="mt-2.5 border-t border-outline-variant/50 pt-2">
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              style={{ fontFamily: "var(--font-nunito)" }}
              aria-expanded={showDetail}
            >
              <span className="material-symbols-outlined text-sm leading-none">
                {showDetail ? "expand_less" : "expand_more"}
              </span>
              {showDetail ? "Hide numbers" : "Show the numbers"}
            </button>
            {showDetail && (
              <p
                className="mt-1.5 text-xs text-on-surface-variant leading-snug"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {(message as { detail: string }).detail}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Answer bubble (experiment card with option buttons) ───────────

function AnswerBubble({
  experiment,
  onSelect,
}: {
  experiment: Experiment;
  onSelect: (optionId: string) => void;
}) {
  const safetyIcon = experiment.safetyTier === "medium" ? "warning" : "health_and_safety";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start"
    >
      <div className="w-full max-w-[760px] rounded-2xl border-2 border-on-surface bg-surface-container p-4 ink-shadow-primary">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-on-surface bg-secondary text-xl">
              <span aria-hidden>{experiment.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xl leading-tight" style={{ fontFamily: "var(--font-quicksand)" }}>
                {experiment.name}
              </p>
              <p className="mt-1 text-xs font-bold text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                {experiment.durationHint} - constrained observation choices
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border-2 border-on-surface bg-white px-3 py-1 text-xs font-bold">
            <span className="material-symbols-outlined text-base">{safetyIcon}</span>
            {experiment.safetyTier}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
          {experiment.instructions}
        </p>
        <div className="mt-3 rounded-lg border-2 border-outline-variant bg-white/70 p-3 text-xs font-bold text-on-surface-variant">
          {experiment.warning}
        </div>

        <div className="mt-4 grid gap-2">
          {experiment.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="rounded-lg border-2 border-on-surface bg-white px-4 py-3 text-left text-sm font-bold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-primary disabled:opacity-50"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Final identification card ─────────────────────────────────────

function FinalCard({
  distribution,
  identifiedElementId,
}: {
  distribution: Distribution;
  identifiedElementId: string | null;
}) {
  const top = getTopCandidate(distribution);
  const isConfirmed = identifiedElementId !== null;
  const label = ELEMENT_LABELS[top.id];

  if (isConfirmed) {
    // Threshold was reached — confirmed identification.
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="rounded-2xl border-[3px] border-on-surface bg-white p-5 ink-shadow"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Final identification</p>
            <h2 className="mt-1 font-bold text-3xl text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
              {label}
            </h2>
            <p className="mt-1 font-bold text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
              {Math.round(top.confidence * 100)}% confidence
            </p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] border-on-surface bg-secondary-container text-3xl font-black text-on-secondary-container">
            {label.charAt(0)}
          </div>
        </div>
        <div className="mt-4 rounded-xl border-2 border-outline-variant bg-primary-fixed/50 p-4">
          <div className="flex items-center gap-2 font-bold text-on-primary-fixed">
            <span className="material-symbols-outlined">lightbulb</span>
            Did you know?
          </div>
          <p className="mt-2 text-sm leading-relaxed text-on-primary-fixed-variant" style={{ fontFamily: "var(--font-nunito)" }}>
            {FUN_FACTS[top.id]}
          </p>
        </div>
      </motion.div>
    );
  }

  // Experiments exhausted but threshold not reached — result is Unknown.
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="rounded-2xl border-[3px] border-on-surface bg-white p-5 ink-shadow"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">Result</p>
          <h2 className="mt-1 font-bold text-3xl text-on-surface" style={{ fontFamily: "var(--font-quicksand)" }}>
            Unknown
          </h2>
          <p className="mt-1 font-bold text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
            Evidence was inconclusive
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] border-on-surface bg-surface-container text-3xl font-black text-on-surface-variant">
          ?
        </div>
      </div>
      <div className="mt-4 rounded-xl border-2 border-outline-variant bg-surface-container-low p-4">
        <div className="flex items-center gap-2 font-bold text-on-surface">
          <span className="material-symbols-outlined">bar_chart</span>
          Most likely match
        </div>
        <p className="mt-1 font-bold text-lg text-on-surface" style={{ fontFamily: "var(--font-quicksand)" }}>
          {label}{" "}
          <span className="text-base font-semibold text-on-surface-variant">
            ({Math.round(top.confidence * 100)}%)
          </span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
          The available experiments did not produce enough evidence to confirm this identification.
          A real laboratory instrument (such as XRF or mass spectrometry) would be needed to go further.
        </p>
      </div>
    </motion.div>
  );
}

// ── Full report (teacher view) ────────────────────────────────────

function FullReport({
  trail,
  whyExplanations,
  whatExplanations,
  distribution,
}: {
  trail: EvidenceEntry[];
  whyExplanations: Record<number, ExplanationPair>;
  whatExplanations: Record<number, ExplanationPair>;
  distribution: Distribution;
}) {
  return (
    <div className="rounded-2xl border-2 border-on-surface bg-white p-5">
      <h3 className="font-bold text-2xl text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
        Full Report
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Same investigation transcript, reformatted for reading.
      </p>
      <div className="mt-4 space-y-4">
        {trail.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No physical experiments were needed after the initial photo read.</p>
        ) : (
          trail.map((entry) => {
            const whyPair = whyExplanations[entry.round];
            const whatPair = whatExplanations[entry.round];
            // Fall back to computing from the entry if pair is missing
            const whatFallback = buildResultExplanation(entry);
            return (
              <div key={`${entry.round}-${entry.experimentId}`} className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Round {entry.round}</p>
                <h4 className="mt-1 font-bold" style={{ fontFamily: "var(--font-quicksand)" }}>
                  {entry.experimentName}
                </h4>

                {/* Why chosen */}
                <p className="mt-2 text-sm">
                  <strong>Why chosen:</strong>{" "}
                  {whyPair?.main ?? "—"}
                </p>
                {whyPair?.detail && (
                  <p className="mt-0.5 text-xs text-on-surface-variant leading-snug pl-1 border-l-2 border-outline-variant">
                    {whyPair.detail}
                  </p>
                )}

                <p className="mt-2 text-sm">
                  <strong>Observed result:</strong> {entry.chosenLabel}
                </p>

                {/* Belief change */}
                <p className="mt-2 text-sm">
                  <strong>Belief change:</strong>{" "}
                  {whatPair?.main ?? whatFallback.main}
                </p>
                {(whatPair?.detail ?? whatFallback.detail) && (
                  <p className="mt-0.5 text-xs text-on-surface-variant leading-snug pl-1 border-l-2 border-outline-variant">
                    {whatPair?.detail ?? whatFallback.detail}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
      <p className="mt-4 rounded-xl border-2 border-on-surface bg-secondary-container p-3 text-sm font-bold">
        {buildFinalMessage(distribution)}
      </p>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────

export function InvestigationThread({
  distribution,
  trail,
  nextExperiment,
  whyExplanations,
  whatExplanations,
  finished,
  identifiedElementId,
  onSelect,
}: {
  distribution: Distribution;
  trail: EvidenceEntry[];
  nextExperiment: Experiment | null;
  whyExplanations?: Record<number, ExplanationPair>;
  whatExplanations?: Record<number, ExplanationPair>;
  finished: boolean;
  /** null = investigation ended as Unknown; non-null = confirmed element id */
  identifiedElementId: string | null;
  onSelect: (optionId: string) => void;
}) {
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeWhy = whyExplanations ?? EMPTY_EXPLANATIONS;
  const safeWhat = whatExplanations ?? EMPTY_EXPLANATIONS;

  const messages = useMemo<Message[]>(() => {
    const built: Message[] = [{ id: "initial-read", role: "ai", body: buildInitialRead(distribution) }];

    for (const entry of trail) {
      // Use only the stored "why" explanation — computed from the correct prior
      // when the experiment was selected. Never recompute from the live distribution.
      const whyPair = safeWhy[entry.round];
      if (whyPair) {
        built.push({
          id: `why-${entry.round}`,
          role: "ai",
          body: whyPair.main,
          detail: whyPair.detail,
        });
      }
      built.push({
        id: `student-${entry.round}`,
        role: "student",
        body: `I observed: ${entry.chosenLabel}`,
      });
      // Result explanation: use stored pair, or fall back to computing from entry
      const whatPair = safeWhat[entry.round];
      const resultPair = whatPair ?? buildResultExplanation(entry);
      built.push({
        id: `result-${entry.round}`,
        role: "ai",
        body: resultPair.main,
        detail: resultPair.detail,
      });
    }

    if (nextExperiment && !finished) {
      const round = trail.length + 1;
      // IMPORTANT: Only emit the "why" bubble from the stored ExplanationPair.
      // It was computed from the correct prior when selectNextExperiment was called.
      // Never fall back to re-computing from the live `distribution` here — that
      // is the already-updated posterior and would produce numbers inconsistent
      // with everything else in the thread.
      const storedWhy = safeWhy[round];
      if (storedWhy) {
        built.push({
          id: `why-current-${nextExperiment.id}`,
          role: "ai",
          body: storedWhy.main,
          detail: storedWhy.detail,
        });
      }
      built.push({ id: `answer-${nextExperiment.id}`, role: "answer", experiment: nextExperiment });
    }

    if (finished) {
      built.push({ id: "final-note", role: "ai", body: buildFinalMessage(distribution), kind: "final" });
    }

    return built;
  }, [distribution, finished, nextExperiment, safeWhat, safeWhy, trail]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, showReport]);

  // DEV-ONLY consistency tripwire: the "prior" of each trail entry must exactly
  // match the "posterior" of the previous entry. If this warning fires, something
  // in the update pipeline has broken the belief-state chain.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    for (let i = 1; i < trail.length; i++) {
      const prevPosterior = JSON.stringify(trail[i - 1].posterior);
      const curPrior = JSON.stringify(trail[i].prior);
      if (prevPosterior !== curPrior) {
        console.warn(
          `[BeliefStateConsistency] Round ${trail[i].round}: prior does not match posterior of round ${trail[i - 1].round}.\n` +
          `  Expected prior: ${prevPosterior}\n` +
          `  Actual   prior: ${curPrior}`
        );
      }
    }
  }, [trail]);

  return (
    <div className="sketch-border bg-surface-container-lowest p-3 sm:p-5 ink-shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-2xl text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
            Investigation Thread
          </h2>
          <p className="text-sm text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
            The conversation is the report.
          </p>
        </div>
        <button
          onClick={() => setShowReport((value) => !value)}
          className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-on-surface bg-white px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-primary"
        >
          <span className="material-symbols-outlined text-base">description</span>
          {showReport ? "Hide report" : "View full report"}
        </button>
      </div>

      <div ref={scrollRef} className="max-h-[68vh] overflow-y-auto pr-1">
        <div className="space-y-4 pb-2">
          <AnimatePresence initial={false}>
            {messages.map((message) =>
              message.role === "answer" ? (
                <AnswerBubble key={message.id} experiment={message.experiment} onSelect={onSelect} />
              ) : (
                <ChatBubble key={message.id} message={message} />
              )
            )}
          </AnimatePresence>
          {finished && <FinalCard distribution={distribution} identifiedElementId={identifiedElementId} />}
          {showReport && (
            <FullReport
              trail={trail}
              whyExplanations={safeWhy}
              whatExplanations={safeWhat}
              distribution={distribution}
            />
          )}
        </div>
      </div>
    </div>
  );
}
