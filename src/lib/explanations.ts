import {
  expectedInformationGain,
  getTopCandidate,
  sortedRealCandidates,
  type Distribution,
  type EvidenceEntry,
} from "./bayes";
import { ELEMENT_LABELS, ELEMENT_SHORT_LABELS } from "./constants";
import type { ElementId } from "./constants";
import { EXPERIMENTS, getExperiment } from "./experiments";

// ── Return type ───────────────────────────────────────────────────

/**
 * Every per-round explanation has two layers:
 *  - main:   kid-friendly science copy (1–3 sentences, no raw stats)
 *  - detail: exact algorithm output for the collapsed "Show the numbers" disclosure
 *
 * All numbers in `detail` are read directly from the real computed posterior —
 * they are never estimated or paraphrased.
 */
export interface ExplanationPair {
  main: string;
  detail: string;
}

// ── Formatting helpers ────────────────────────────────────────────

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function bits(value: number): string {
  return `${value.toFixed(2)} bits`;
}

function shortLabel(id: ElementId): string {
  return ELEMENT_SHORT_LABELS[id] ?? id;
}

function sentenceList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function topPair(distribution: Distribution): Array<{ id: ElementId; confidence: number }> {
  return sortedRealCandidates(distribution).slice(0, 2);
}

// ── Per-experiment science intros for "why" messages ──────────────

/**
 * One or two sentences explaining what physical/chemical property the
 * experiment actually measures, and why that property is diagnostic.
 * Written at a middle-school reading level, no statistics.
 */
const WHY_SCIENCE: Record<string, string> = {
  magnet_test:
    "Iron is one of the only common pure elements that's strongly magnetic — its atomic structure creates internal magnetic domains that line up with an outside field. Most other metals and all the non-metals in this kit don't respond at all, so this test is very decisive.",
  water_float_test:
    "Dense metals like iron, copper, and zinc are 7–9 g/cm³ — they drop straight to the bottom. Non-metals like sulfur and graphite are far lighter and, because their surfaces repel water, can hover near the surface. This separates the heavy metals from the lighter non-metals in one step.",
  vinegar_test:
    "Vinegar is a mild acid, and metals react to it in very different ways. Zinc fizzes vigorously as the acid dissolves it and releases hydrogen gas. Iron shows only a slight reaction. Copper, sulfur, and graphite barely react at all. Acid reactivity is a classic sorting test in chemistry.",
  conductivity_test:
    "Metals conduct electricity because their outer electrons aren't tied to individual atoms — they flow freely through the material. Non-metals like sulfur have no free electrons and act as insulators. This test cleanly divides conductors from non-conductors in seconds.",
  weight_test:
    "Aluminum has roughly a third the density of iron, copper, or zinc — about 2.7 g/cm³ compared to 7–9 g/cm³ for the heavier metals. That difference in heft is immediately noticeable by hand, which is exactly why aluminum is used in aircraft and soda cans.",
  scratch_test:
    "Every material has a hardness — the Mohs scale ranks them from 1 (talc) to 10 (diamond). Sulfur and graphite both rank around 1–2 and can be scratched by a fingernail. The metals here rank 2.5–4 and resist a fingernail easily. A copper coin (~Mohs 3) can scratch softer metals but not the harder ones.",
  heat_test:
    "Metals conduct heat the same way they conduct electricity: free electrons carry energy rapidly from atom to atom. Non-metals trap heat instead. Copper is one of the best heat conductors of any element — nearly 400 W/m·K — which is why it shows up in cookware, heat sinks, and radiators.",
  sound_test:
    "Tap a piece of metal and it rings because its atoms are locked in a tight crystalline lattice that vibrates together as a unit. Non-metals like sulfur and graphite absorb or scatter the vibration instead, giving a dull thud. The difference is usually unmistakable.",
  streak_test:
    "Streak color — the powder a material leaves on unglazed ceramic — is a classic mineralogy test. Surface tarnish can fool your eye, but the streak always shows the material's true color. Copper leaves a reddish-brown mark, graphite leaves gray-black, sulfur leaves yellow, and most metals leave no visible color.",
};

// ── Per-outcome science explanations for "result" messages ────────

/**
 * One or two sentences explaining what the specific observed outcome means
 * in real physical/chemical terms. Written per-experiment, per-outcome —
 * not a generic template.
 *
 * A short confidence tail (e.g. "That's looking strongly like Copper.")
 * is appended dynamically by buildResultExplanation when confidence ≥ 80%.
 */
const RESULT_SCIENCE: Record<string, Record<string, string>> = {
  magnet_test: {
    attracted:
      "It moved toward the magnet — that's iron's signature. Pure iron is ferromagnetic; none of the other candidates in this kit share that property.",
    not_attracted:
      "No response to the magnet. Iron is ferromagnetic and would have reacted, so we can effectively rule it out. Everything else in this kit is non-magnetic.",
  },
  water_float_test: {
    sinks:
      "It sank right to the bottom — it's denser than water, which is what we expect from any of the heavy metals. Sulfur and graphite can hover near the surface, so this result sets them aside.",
    floats_or_hovers:
      "It floated or barely sank — that's the signature of a material that's light and water-repelling, like sulfur or graphite. Dense metals are too heavy to do this.",
  },
  vinegar_test: {
    vigorous_fizz:
      "Strong fizzing means the acid is actively dissolving the metal and releasing hydrogen gas. Zinc does this more dramatically than any other candidate in this kit — this is a highly specific result.",
    slight_fizz:
      "A few small bubbles — a mild reaction. Iron and aluminum can both produce a slight fizz in acetic acid, while zinc would go much further and copper would barely react. It narrows things without pinpointing one candidate.",
    no_reaction:
      "No reaction at all — the acid left the surface untouched. Copper, sulfur, and graphite all ignore acetic acid, while zinc and aluminum would visibly fizz. This rules out the reactive candidates.",
  },
  conductivity_test: {
    conducts:
      "The LED lit up — electrons can flow freely through the sample. That's the hallmark of metallic bonding. Sulfur is off the list; it's a classic electrical insulator.",
    does_not_conduct:
      "The LED stayed off — no free electrons, no current. That's the behavior of a non-metal like sulfur. All the pure metals in this kit conduct electricity, so this result points firmly away from them.",
  },
  weight_test: {
    feels_light:
      "It felt surprisingly light for its size — that's aluminum's most distinctive physical property. Its density (~2.7 g/cm³) is about a third of iron or copper, which is why it's used in aircraft frames and drink cans.",
    feels_heavy:
      "Good heft for its size — that's what we expect from the denser metals: iron (~7.9), copper (~9.0), or zinc (~7.1 g/cm³). Aluminum would feel noticeably lighter, so we can lower it on the list.",
  },
  scratch_test: {
    fingernail_scratches:
      "A fingernail left a mark — this material is quite soft, below ~2.5 on the Mohs scale. Sulfur (~2) and graphite (~1–2) both sit in that range. Real metals are considerably harder and resist a fingernail.",
    coin_scratches:
      "The copper coin got through but the fingernail didn't — that's medium hardness, roughly 2.5–3 on the Mohs scale. Aluminum and zinc both sit in this range; harder metals like iron and copper resist a coin.",
    nothing_scratches:
      "Neither tool left a mark — this is a hard material. Iron (~4), copper (~3), and zinc (~2.5) all resist a copper coin. The soft non-metals like sulfur and graphite scratch much more easily.",
  },
  heat_test: {
    conducts_heat_fast:
      "It warmed up quickly — free electrons carried the heat through the metal rapidly. Copper is particularly good at this; even iron and zinc warm a wrist noticeably fast.",
    conducts_heat_slow:
      "It barely warmed up — this material traps heat rather than moving it. Non-metals like sulfur (~0.2 W/m·K) are poor heat conductors compared to any of the metals in this kit.",
  },
  sound_test: {
    clear_ring:
      "A clear ringing tone — the crystalline metal lattice vibrated together and sustained the note. Non-metals absorb or scatter that vibration and would give a dull thud instead.",
    dull_thud:
      "A thud with no ring — the material absorbed the vibration rather than carrying it. Pure metals ring when struck; sulfur and graphite thud. This points toward a non-metal.",
  },
  streak_test: {
    gray_black_streak:
      "A gray-black streak — that's graphite's signature. Graphite's layered carbon structure is soft enough to powder onto rough ceramic, leaving a distinctive dark mark almost nothing else replicates.",
    yellow_streak:
      "A yellow streak — that's sulfur's mark. Sulfur is soft enough to leave powder on the tile, and its natural yellow color shows clearly. This is one of the most visually specific results in the kit.",
    reddish_copper_streak:
      "A reddish-brown streak — copper's fingerprint. When copper is powdered against rough ceramic, its natural color comes through clearly. Very few other materials leave a colored streak at all, let alone a reddish one.",
    no_streak:
      "No colored streak — the sample is too hard to leave a powder on the tile. That's what we expect from most metals: iron, copper, zinc, and aluminum all leave little or no visible mark.",
  },
};

// ── Why-experiment builder ────────────────────────────────────────

/** Used only for the detail string — kept from the original implementation. */
function strongestSeparators(distribution: Distribution, experimentId: string): string {
  const exp = getExperiment(experimentId);
  const [first, second] = topPair(distribution);
  if (!exp || !first || !second) return "the leading candidates";

  const optionDiffs = exp.options.map((option) => ({
    label: option.label.split(" - ")[0],
    diff: Math.abs((option.likelihoods[first.id] ?? 0) - (option.likelihoods[second.id] ?? 0)),
  }));
  const strongest = optionDiffs.sort((a, b) => b.diff - a.diff)[0];
  if (!strongest || strongest.diff < 0.15) {
    return `${shortLabel(first.id)} (${pct(first.confidence)}) and ${shortLabel(second.id)} (${pct(second.confidence)})`;
  }
  return `${shortLabel(first.id)} (${pct(first.confidence)}) and ${shortLabel(second.id)} (${pct(second.confidence)}) — "${strongest.label}" fits one better than the other`;
}

export function buildWhyExperimentExplanation(
  distribution: Distribution,
  nextExperimentId: string,
  completedExperimentIds: string[]
): ExplanationPair {
  const exp = getExperiment(nextExperimentId);
  const gain = expectedInformationGain(distribution, nextExperimentId);
  const completed = new Set(completedExperimentIds);

  // Compute alternatives for the detail string
  const alternatives = EXPERIMENTS
    .filter((candidate) => candidate.id !== nextExperimentId && !completed.has(candidate.id))
    .map((candidate) => ({
      name: candidate.shortName,
      gain: expectedInformationGain(distribution, candidate.id),
    }))
    .sort((a, b) => b.gain - a.gain);
  const nextBest = alternatives[0];

  // ── detail: original algorithm output ────────────────────────────
  const comparison = nextBest
    ? `Highest expected information gain right now: ${bits(gain)}, ahead of ${nextBest.name} (${bits(nextBest.gain)}).`
    : `Only useful test remaining: ${bits(gain)} expected information gain.`;
  const detail = `${exp?.name ?? nextExperimentId}: ${comparison} Best separator: ${strongestSeparators(distribution, nextExperimentId)}.`;

  // ── main: science-first, kid-friendly ────────────────────────────
  const scienceIntro =
    WHY_SCIENCE[nextExperimentId] ??
    `The ${exp?.name ?? nextExperimentId} is the most informative test available right now.`;

  const [top1, top2] = topPair(distribution);
  let candidateLine: string;
  if (!top1) {
    candidateLine = "Let's run this test and see what it shows.";
  } else if (!top2 || Math.abs(top1.confidence - top2.confidence) < 0.06) {
    // Two candidates close enough to be genuine rivals
    candidateLine = `Right now ${shortLabel(top1.id)} and ${shortLabel(top2!.id)} are the two strongest candidates — let's see which side this test puts us on.`;
  } else {
    // One clear leader
    candidateLine = `Right now ${shortLabel(top1.id)} is the leading candidate — let's use this test to check that.`;
  }

  const main = `${scienceIntro} ${candidateLine}`;
  return { main, detail };
}

// ── Result-explanation builder ────────────────────────────────────

export function buildResultExplanation(entry: EvidenceEntry): ExplanationPair {
  const before = sortedRealCandidates(entry.prior);
  const after = sortedRealCandidates(entry.posterior);
  const beforeTop = before[0];
  const afterTop = after[0];

  // Movers — for detail string
  const movers = after
    .map(({ id }) => ({
      id,
      before: entry.prior[id] ?? 0,
      after: entry.posterior[id] ?? 0,
      delta: (entry.posterior[id] ?? 0) - (entry.prior[id] ?? 0),
    }))
    .filter((item) => Math.abs(item.delta) >= 0.03)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  const movement = movers.length
    ? sentenceList(
        movers.map((item) =>
          `${shortLabel(item.id)} ${item.delta >= 0 ? "rose" : "fell"} from ${pct(item.before)} to ${pct(item.after)}`
        )
      )
    : "the probabilities barely moved — this clue did not strongly favor any one candidate";

  // Ruled-out candidates — used in both detail and main
  const ELIMINATED_THRESHOLD = 0.05;
  const ruledOut = after
    .filter(
      ({ id, confidence }) =>
        confidence <= ELIMINATED_THRESHOLD &&
        id !== afterTop.id &&
        (entry.prior[id] ?? 0) > ELIMINATED_THRESHOLD
    )
    .map(({ id }) => shortLabel(id));

  const ruledOutClause =
    ruledOut.length > 0
      ? ` ${sentenceList(ruledOut)} ${ruledOut.length === 1 ? "was" : "were"} effectively ruled out (now ≤${ELIMINATED_THRESHOLD * 100}%).`
      : "";

  // ── detail: exact algorithm output ───────────────────────────────
  const detail =
    `Before: ${shortLabel(beforeTop.id)} leading at ${pct(beforeTop.confidence)}. ` +
    `After: ${shortLabel(afterTop.id)} leading at ${pct(afterTop.confidence)}. ` +
    `In the update, ${movement}.${ruledOutClause}`;

  // ── main: per-outcome science text ───────────────────────────────
  const scienceText = RESULT_SCIENCE[entry.experimentId]?.[entry.chosenOptionId];

  let main: string;
  if (scienceText) {
    // Append a brief confidence tail when the posterior is strongly decisive
    const confidence = afterTop.confidence;
    let tail = "";
    if (confidence >= 0.80) {
      tail = ` That's looking strongly like ${shortLabel(afterTop.id)}.`;
    } else if (confidence >= 0.60 && beforeTop.id !== afterTop.id) {
      // Lead changed with moderate confidence — worth noting
      tail = ` The lead has shifted to ${shortLabel(afterTop.id)}.`;
    }
    // Append ruled-out note if any candidates were eliminated
    const ruledOutMain =
      ruledOut.length > 0
        ? ` ${sentenceList(ruledOut)} ${ruledOut.length === 1 ? "can be crossed off" : "can both be crossed off"} the list.`
        : "";
    main = `${scienceText}${tail}${ruledOutMain}`;
  } else {
    // Generic fallback (shouldn't happen for any experiment currently in the kit)
    main =
      `The ${entry.experimentName} result has updated the picture. ` +
      `${shortLabel(afterTop.id)} is now the most likely candidate.${ruledOutClause}`;
  }

  return { main, detail };
}

// ── Static message builders (plain strings, no detail needed) ─────

export function buildInitialRead(distribution: Distribution): string {
  const top = sortedRealCandidates(distribution).slice(0, 3);
  return `I have a first read from the photo. The leading candidates are ${sentenceList(
    top.map(({ id, confidence }) => `${ELEMENT_LABELS[id]} at ${pct(confidence)}`)
  )}, so I am going to collect physical evidence before making a final call.`;
}

export function buildFinalMessage(distribution: Distribution): string {
  const top = getTopCandidate(distribution);
  return `The investigation is ready to close. The strongest real-element answer is ${ELEMENT_LABELS[top.id]} at ${pct(top.confidence)} confidence.`;
}
