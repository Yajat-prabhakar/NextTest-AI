import type { ElementId } from "./constants";

// ── Types ──────────────────────────────────────────────────────────

export type SafetyTier = "low" | "medium" | "high";

export interface ExperimentOption {
  id: string;
  label: string;
  /** Likelihood P(option | element) for each element. Must sum ≈ 1 per element across options. */
  likelihoods: Record<ElementId, number>;
}

export interface Experiment {
  id: string;
  name: string;
  shortName: string;
  instructions: string;
  safetyTier: SafetyTier;
  warning: string;
  durationHint: string;
  icon: string; // emoji for prototype
  options: ExperimentOption[];
}

// ── Fixed, pre-approved menu — never AI-generated ─────────────────

export const EXPERIMENTS: Experiment[] = [
  {
    id: "magnet_test",
    name: "Magnet Test",
    shortName: "Magnet",
    instructions:
      "Hold the small bar magnet 1–2 cm from the sample. Do not touch the sample with the magnet. Observe whether the sample is pulled toward the magnet or jumps to it.",
    safetyTier: "low",
    warning:
      "Keep magnet away from phones, cards, and medical devices. Do not swallow.",
    durationHint: "~15 sec",
    icon: "🧲",
    options: [
      {
        id: "attracted",
        label: "Attracted — sample moves toward magnet",
        likelihoods: {
          iron: 0.92,
          copper: 0.02,
          zinc: 0.03,
          aluminum: 0.02,
          sulfur: 0.01,
          graphite: 0.02,
          unknown: 0.2,
        },
      },
      {
        id: "not_attracted",
        label: "Not attracted — no movement",
        likelihoods: {
          iron: 0.08,
          copper: 0.98,
          zinc: 0.97,
          aluminum: 0.98,
          sulfur: 0.99,
          graphite: 0.98,
          unknown: 0.8,
        },
      },
    ],
  },
  {
    id: "water_float_test",
    name: "Water Float / Density Test",
    shortName: "Float",
    instructions:
      "Fill the clear cup ¾ with water. Gently place the sample (or a pea-sized piece) on the surface and let go. Watch for 10 seconds.",
    safetyTier: "low",
    warning:
      "Do this over a tray. Dry the sample after. Do not drink the water.",
    durationHint: "~30 sec",
    icon: "💧",
    options: [
      {
        id: "sinks",
        label: "Sinks quickly to the bottom",
        likelihoods: {
          iron: 0.98,
          copper: 0.97,
          zinc: 0.96,
          aluminum: 0.88,
          sulfur: 0.3,
          graphite: 0.35,
          unknown: 0.5,
        },
      },
      {
        id: "floats_or_hovers",
        label: "Floats or hovers / sinks very slowly",
        likelihoods: {
          iron: 0.02,
          copper: 0.03,
          zinc: 0.04,
          aluminum: 0.12,
          sulfur: 0.7,
          graphite: 0.65,
          unknown: 0.5,
        },
      },
    ],
  },
  {
    id: "vinegar_test",
    name: "Vinegar Reaction Test",
    shortName: "Vinegar",
    instructions:
      "Place the sample in the small dish. Add 2–3 drops of white vinegar to its surface. Watch closely for 60 seconds for bubbles or fizzing. Adult supervision recommended.",
    safetyTier: "medium",
    warning:
      "Vinegar is mildly acidic. Wear safety glasses. Rinse skin if splashed. Do not mix with other chemicals.",
    durationHint: "~60 sec",
    icon: "🧪",
    options: [
      {
        id: "vigorous_fizz",
        label: "Vigorous fizz — many bubbles quickly",
        likelihoods: {
          iron: 0.08,
          copper: 0.02,
          zinc: 0.82,
          aluminum: 0.04,
          sulfur: 0.01,
          graphite: 0.01,
          unknown: 0.15,
        },
      },
      {
        id: "slight_fizz",
        label: "Slight fizz — a few small bubbles",
        likelihoods: {
          iron: 0.22,
          copper: 0.05,
          zinc: 0.12,
          aluminum: 0.3,
          sulfur: 0.04,
          graphite: 0.02,
          unknown: 0.2,
        },
      },
      {
        id: "no_reaction",
        label: "No reaction — surface looks unchanged",
        likelihoods: {
          iron: 0.7,
          copper: 0.93,
          zinc: 0.06,
          aluminum: 0.66,
          sulfur: 0.95,
          graphite: 0.97,
          unknown: 0.65,
        },
      },
    ],
  },
  {
    id: "conductivity_test",
    name: "Conductivity Test",
    shortName: "Conductivity",
    instructions:
      "Connect the sample between the two alligator clips to close the circuit. Observe whether the LED lights up. Make sure the sample touches both clips firmly.",
    safetyTier: "low",
    warning:
      "Low-voltage battery circuit only (≤ 3 V). Do not use mains power. Disconnect when finished.",
    durationHint: "~20 sec",
    icon: "🔋",
    options: [
      {
        id: "conducts",
        label: "Conducts — LED lights up",
        likelihoods: {
          iron: 0.95,
          copper: 0.98,
          zinc: 0.92,
          aluminum: 0.94,
          sulfur: 0.03,
          graphite: 0.85,
          unknown: 0.4,
        },
      },
      {
        id: "does_not_conduct",
        label: "Does not conduct — LED stays off",
        likelihoods: {
          iron: 0.05,
          copper: 0.02,
          zinc: 0.08,
          aluminum: 0.06,
          sulfur: 0.97,
          graphite: 0.15,
          unknown: 0.6,
        },
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.id === id);
}

export function getExperimentOption(
  experimentId: string,
  optionId: string
): ExperimentOption | undefined {
  return getExperiment(experimentId)?.options.find((o) => o.id === optionId);
}
