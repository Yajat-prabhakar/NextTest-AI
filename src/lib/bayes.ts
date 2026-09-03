/**
 * Deterministic Bayesian update — NOT the LLM.
 * Pure functions, fully unit-testable.
 */
import { ELEMENT_IDS, REAL_ELEMENT_IDS, EPSILON as DEFAULT_EPSILON, type ElementId } from "./constants";
import { EXPERIMENTS, getExperiment } from "./experiments";

export type Distribution = Record<ElementId, number>;

export interface EvidenceEntry {
  round: number;
  experimentId: string;
  experimentName: string;
  chosenOptionId: string;
  chosenLabel: string;
  prior: Distribution;
  posterior: Distribution;
}

const EPS = 1e-12;

// ── Distribution helpers ─────────────────────────────────────────

export function createUniformDistribution(): Distribution {
  const p = 1 / ELEMENT_IDS.length;
  const d = {} as Distribution;
  for (const id of ELEMENT_IDS) d[id] = p;
  return d;
}

export function createDistributionFromArray(
  values: number[]
): Distribution {
  if (values.length !== ELEMENT_IDS.length)
    throw new Error(
      `Expected ${ELEMENT_IDS.length} values, got ${values.length}`
    );
  const d = {} as Distribution;
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum < EPS) throw new Error("Distribution sums to ~0");
  for (let i = 0; i < ELEMENT_IDS.length; i++) {
    d[ELEMENT_IDS[i]] = values[i] / sum;
  }
  return d;
}

export function normalizeDistribution(d: Distribution): Distribution {
  const sum = ELEMENT_IDS.reduce((s, id) => s + (d[id] ?? 0), 0);
  if (sum < EPS) return createUniformDistribution();
  const out = {} as Distribution;
  for (const id of ELEMENT_IDS) out[id] = (d[id] ?? 0) / sum;
  return out;
}

export function distributionToArray(d: Distribution): number[] {
  return ELEMENT_IDS.map((id) => d[id] ?? 0);
}

// ── Core Bayes update ────────────────────────────────────────────

/**
 * Naive Bayes update:
 *   posterior[element] ∝ prior[element] × P(result | element)
 * then normalized.
 */
export function bayesianUpdate(
  prior: Distribution,
  experimentId: string,
  chosenOptionId: string
): Distribution {
  const exp = getExperiment(experimentId);
  if (!exp) throw new Error(`Unknown experiment: ${experimentId}`);
  const opt = exp.options.find((o) => o.id === chosenOptionId);
  if (!opt) throw new Error(`Unknown option ${chosenOptionId} for ${experimentId}`);

  const unnormalized = {} as Distribution;
  for (const id of ELEMENT_IDS) {
    const likelihood = opt.likelihoods[id] ?? EPS;
    unnormalized[id] = (prior[id] ?? 0) * Math.max(likelihood, EPS);
  }
  return normalizeDistribution(unnormalized);
}

/** Apply a sequence of evidence entries on top of a prior (useful for replay). */
export function applyEvidenceSequence(
  prior: Distribution,
  steps: Array<{ experimentId: string; optionId: string }>
): Distribution {
  let cur = { ...prior };
  for (const s of steps) cur = bayesianUpdate(cur, s.experimentId, s.optionId);
  return cur;
}

// ── Entropy & information gain ───────────────────────────────────

export function entropy(d: Distribution): number {
  let h = 0;
  for (const id of ELEMENT_IDS) {
    const p = d[id] ?? 0;
    if (p > EPS) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Expected information gain for an experiment given current distribution.
 * EIG = H(prior) − E_result[ H(posterior(result)) ]
 * where expectation weights by P(result) = Σ_element P(result|element)·P(element)
 */
export function expectedInformationGain(
  prior: Distribution,
  experimentId: string
): number {
  const exp = getExperiment(experimentId);
  if (!exp) throw new Error(`Unknown experiment: ${experimentId}`);

  const hPrior = entropy(prior);
  let expectedPosteriorEntropy = 0;

  for (const opt of exp.options) {
    // P(result) = sum_element P(result|element)*P(element)
    let pResult = 0;
    for (const id of ELEMENT_IDS) {
      pResult += (opt.likelihoods[id] ?? EPS) * (prior[id] ?? 0);
    }
    if (pResult < EPS) continue;

    // posterior conditioned on this result
    const posterior = bayesianUpdate(prior, experimentId, opt.id);
    expectedPosteriorEntropy += pResult * entropy(posterior);
  }

  return hPrior - expectedPosteriorEntropy;
}


/**
 * Select the next experiment with maximal expected information gain
 * among experiments not yet performed.
 *
 * Returns null when:
 *   - all experiments are completed, OR
 *   - the best remaining info gain < epsilon (evidence has plateaued)
 *
 * Ties broken by original menu order (deterministic).
 *
 * @param epsilon - min bits of info gain considered worth another test.
 *   Defaults to EPSILON (0.03) from constants — matches simulation tuning.
 */
export function selectNextExperiment(
  prior: Distribution,
  completedExperimentIds: Set<string> | string[],
  epsilon = DEFAULT_EPSILON
): string | null {
  const completed = new Set(completedExperimentIds);
  let bestId: string | null = null;
  let bestGain = -Infinity;

  for (const exp of EXPERIMENTS) {
    if (completed.has(exp.id)) continue;
    const gain = expectedInformationGain(prior, exp.id);
    if (gain > bestGain + 1e-9) {
      bestGain = gain;
      bestId = exp.id;
    }
  }

  // Plateau guard: don't run another test if the evidence isn't moving
  if (bestGain <= epsilon) return null;

  return bestId;
}

// ── Threshold / decision helpers ─────────────────────────────────

/**
 * Returns the top element by probability.
 *
 * @param d - current belief distribution
 * @param realOnly - when true (default), "unknown" is excluded from the
 *   argmax so it can never be returned as the final answer.
 *   Pass false only when you explicitly want to include unknown
 *   (e.g. internal diagnostics).
 */
export function getTopCandidate(
  d: Distribution,
  realOnly = true
): { id: ElementId; confidence: number } {
  const ids = realOnly ? (REAL_ELEMENT_IDS as ReadonlyArray<ElementId>) : ELEMENT_IDS;
  let bestId: ElementId = ids[0];
  let best = d[bestId] ?? 0;
  for (const id of ids) {
    const v = d[id] ?? 0;
    if (v > best) {
      best = v;
      bestId = id;
    }
  }
  return { id: bestId, confidence: best };
}

export function hasReachedThreshold(
  d: Distribution,
  threshold: number
): boolean {
  return getTopCandidate(d).confidence >= threshold;
}

/** All elements sorted descending by confidence — includes unknown. */
export function sortedCandidates(
  d: Distribution
): Array<{ id: ElementId; confidence: number }> {
  return [...ELEMENT_IDS]
    .map((id) => ({ id, confidence: d[id] ?? 0 }))
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * The 6 real elements sorted descending by confidence — excludes unknown.
 * Use this for student-facing confidence displays.
 */
export function sortedRealCandidates(
  d: Distribution
): Array<{ id: ElementId; confidence: number }> {
  return (REAL_ELEMENT_IDS as ReadonlyArray<ElementId>)
    .map((id) => ({ id, confidence: d[id] ?? 0 }))
    .sort((a, b) => b.confidence - a.confidence);
}

