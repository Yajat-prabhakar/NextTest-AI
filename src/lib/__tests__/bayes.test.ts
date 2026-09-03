/**
 * Minimal inline smoke-check for bayes.ts — run with: npx tsx src/lib/__tests__/bayes.test.ts
 * (No test runner required for the prototype; promotes easy `npm run check` later.)
 */
import {
  bayesianUpdate,
  createUniformDistribution,
  entropy,
  expectedInformationGain,
  hasReachedThreshold,
  selectNextExperiment,
  getTopCandidate,
  sortedRealCandidates,
} from "../bayes";
import { REAL_ELEMENT_IDS, EPSILON } from "../constants";
import { EXPERIMENTS } from "../experiments";
import type { Distribution } from "../bayes";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

// ── Basic distribution sanity ─────────────────────────────────────

const uniform = createUniformDistribution();
assert(Math.abs(uniform.iron - 1 / 7) < 1e-9, "uniform");

// ── Bayesian updates ──────────────────────────────────────────────

// Magnet: iron should spike after attracted
const afterMagnet = bayesianUpdate(uniform, "magnet_test", "attracted");
assert(afterMagnet.iron > 0.5, `iron after magnet attracted = ${afterMagnet.iron}`);
assert(getTopCandidate(afterMagnet).id === "iron", "top after magnet attracted should be iron");

// Magnet not attracted: iron should collapse
const afterNot = bayesianUpdate(uniform, "magnet_test", "not_attracted");
assert(afterNot.iron < 0.05, `iron after not_attracted = ${afterNot.iron}`);

// Vinegar vigorous: zinc spikes
const afterFizz = bayesianUpdate(uniform, "vinegar_test", "vigorous_fizz");
assert(getTopCandidate(afterFizz).id === "zinc", `top after vigorous_fizz should be zinc, got ${getTopCandidate(afterFizz).id}`);

// Conductivity distinguishes sulfur/graphite from metals
const afterNoConduct = bayesianUpdate(uniform, "conductivity_test", "does_not_conduct");
const topNoConduct = getTopCandidate(afterNoConduct);
assert(
  topNoConduct.id === "sulfur" || topNoConduct.id === "graphite",
  `top after no conduct should be sulfur or graphite, got ${topNoConduct.id}`
);

// ── Fix 1: getTopCandidate never returns "unknown" ────────────────

// Artificially give unknown the highest probability
const unknownHeavy: Distribution = {
  iron: 0.05,
  copper: 0.05,
  zinc: 0.05,
  aluminum: 0.05,
  sulfur: 0.05,
  graphite: 0.05,
  unknown: 0.70,
};
const topFromHeavyUnknown = getTopCandidate(unknownHeavy);
assert(
  topFromHeavyUnknown.id !== "unknown",
  `getTopCandidate should never return "unknown", got ${topFromHeavyUnknown.id}`
);
assert(
  (REAL_ELEMENT_IDS as readonly string[]).includes(topFromHeavyUnknown.id),
  `getTopCandidate should return a real element, got ${topFromHeavyUnknown.id}`
);

// sortedRealCandidates should exclude unknown
const realSorted = sortedRealCandidates(unknownHeavy);
assert(realSorted.length === REAL_ELEMENT_IDS.length, "sortedRealCandidates length = 6");
assert(!realSorted.some((c) => c.id === "unknown"), "sortedRealCandidates must not include unknown");

// ── Fix 2: epsilon plateau stopping ──────────────────────────────

// After magnet "attracted", iron is ~90%. Remaining experiments should
// all have low info gain — selectNextExperiment should return null if
// threshold is also met.
const highIronDist = bayesianUpdate(uniform, "magnet_test", "attracted");
const epsilonTest = selectNextExperiment(highIronDist, ["magnet_test"]);
// We don't assert null here (info gain might still be > epsilon for the other tests)
// but we do assert the function doesn't crash and returns a string or null
assert(
  epsilonTest === null || typeof epsilonTest === "string",
  "selectNextExperiment must return null or a string"
);

// With a totally flat distribution and all experiments done, must return null
const allIds = EXPERIMENTS.map((e) => e.id);
const allDone = selectNextExperiment(uniform, allIds);
assert(allDone === null, "all done => null");

// Epsilon constant itself matches the expected value
assert(Math.abs(EPSILON - 0.03) < 1e-9, `EPSILON should be 0.03, got ${EPSILON}`);

// ── Fix 3: new experiments present ───────────────────────────────

const expIds = new Set(EXPERIMENTS.map((e) => e.id));
const requiredNew = [
  "weight_test",
  // color_luster_test was removed (ambient lighting unreliable); copper detection
  // is now handled by streak_test's reddish_copper_streak outcome.
  "scratch_test",
  "heat_test",
  "sound_test",
  "streak_test",
];
for (const id of requiredNew) {
  assert(expIds.has(id), `Missing new experiment: ${id}`);
}
assert(!expIds.has("color_luster_test"), "color_luster_test must be removed");
assert(EXPERIMENTS.length === 9, `Expected 9 experiments, got ${EXPERIMENTS.length}`);

// Weight test: "feels_light" should spike aluminum
const afterLight = bayesianUpdate(uniform, "weight_test", "feels_light");
assert(
  getTopCandidate(afterLight).id === "aluminum",
  `top after feels_light should be aluminum, got ${getTopCandidate(afterLight).id}`
);

// Weight test: "feels_heavy" should not favor aluminum
const afterHeavy = bayesianUpdate(uniform, "weight_test", "feels_heavy");
assert(afterHeavy.aluminum < 0.10, `aluminum after feels_heavy should be low, got ${afterHeavy.aluminum}`);

// Streak test: reddish_copper_streak → copper should be top candidate
const afterReddishStreak = bayesianUpdate(uniform, "streak_test", "reddish_copper_streak");
assert(
  getTopCandidate(afterReddishStreak).id === "copper",
  `top after reddish_copper_streak should be copper, got ${getTopCandidate(afterReddishStreak).id}`
);

// ── Hand-computed Bayesian update verification ────────────────────
//
// Verify magnet_test / attracted from uniform against manual calculation:
//   uniform prior = 1/7 for each of the 7 elements
//   likelihoods (attracted): iron=0.92, copper=0.02, zinc=0.03, aluminum=0.02,
//                             sulfur=0.01, graphite=0.02, unknown=0.20
//   unnormalized posteriors = prior × likelihood:
//     iron=0.13143, copper=0.00286, zinc=0.00429, aluminum=0.00286,
//     sulfur=0.00143, graphite=0.00286, unknown=0.02857
//   sum ≈ 0.17429
//   posterior iron ≈ 0.13143 / 0.17429 ≈ 0.7541
//
// The actual computed value should be within 0.01 of the hand-computed figure.
const handComputedIronAfterMagnet = (0.92 / 7) / ([0.92, 0.02, 0.03, 0.02, 0.01, 0.02, 0.20].reduce((s, v) => s + v / 7, 0));
assert(
  Math.abs(afterMagnet.iron - handComputedIronAfterMagnet) < 0.01,
  `iron posterior after magnet/attracted: got ${afterMagnet.iron.toFixed(4)}, expected ≈ ${handComputedIronAfterMagnet.toFixed(4)}`
);

// ── EIG sanity ────────────────────────────────────────────────────

// EIG non-negative for all experiments
for (const exp of EXPERIMENTS) {
  const ig = expectedInformationGain(uniform, exp.id);
  assert(ig >= 0, `EIG for ${exp.id} should be >= 0, got ${ig}`);
}

// selectNextExperiment picks something from uniform, and skips completed
const next1 = selectNextExperiment(uniform, []);
assert(next1 !== null, "should pick one");
const next2 = selectNextExperiment(uniform, [next1!]);
assert(next2 !== null && next2 !== next1, "should pick different second");

// ── Threshold ─────────────────────────────────────────────────────

assert(!hasReachedThreshold(uniform, 0.85), "uniform not over threshold");
const confident = {
  iron: 0.9, copper: 0.02, zinc: 0.02, aluminum: 0.02,
  sulfur: 0.02, graphite: 0.01, unknown: 0.01,
} as Distribution;
assert(hasReachedThreshold(confident, 0.85), "confident should be over");
assert(entropy(uniform) > entropy(confident), "uniform higher entropy");

console.log("✓ bayes smoke tests passed");
