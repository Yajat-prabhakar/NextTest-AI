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
} from "../bayes";
import { ELEMENT_IDS } from "../constants";
import type { Distribution } from "../bayes";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

const uniform = createUniformDistribution();
assert(Math.abs(uniform.iron - 1 / 7) < 1e-9, "uniform");

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
  topNoConduct.id === "sulfur" || topNoConduct.id === "unknown",
  `top after no conduct should be sulfur/unknown, got ${topNoConduct.id}`
);

// EIG is non-negative and highest for most informative test given uniform?
const gains = ELEMENT_IDS; // dummy to avoid unused
void gains;
const gMagnet = expectedInformationGain(uniform, "magnet_test");
const gCond = expectedInformationGain(uniform, "conductivity_test");
assert(gMagnet >= 0 && gCond >= 0, "EIG non-negative");

// selectNextExperiment picks something, and skips completed
const next1 = selectNextExperiment(uniform, []);
assert(next1 !== null, "should pick one");
const next2 = selectNextExperiment(uniform, [next1!]);
assert(next2 !== null && next2 !== next1, "should pick different second");
const allDone = selectNextExperiment(uniform, ["magnet_test", "water_float_test", "vinegar_test", "conductivity_test"]);
assert(allDone === null, "all done => null");

// threshold
assert(!hasReachedThreshold(uniform, 0.85), "uniform not over threshold");
const confident = { ...uniform, iron: 0.9, copper: 0.02, zinc: 0.02, aluminum: 0.02, sulfur: 0.02, graphite: 0.01, unknown: 0.01 } as Distribution;
assert(hasReachedThreshold(confident, 0.85), "confident should be over");

assert(entropy(uniform) > entropy(confident), "uniform higher entropy");

console.log("✓ bayes smoke tests passed");
