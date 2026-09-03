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
  // ── New experiments added for aluminum/zinc discrimination and ─────
  // ── broader non-metal separation (see HackTheStack report, Problem 3) ─
  {
    id: "weight_test",
    name: "Weight-for-Size (Heft) Test",
    shortName: "Heft",
    instructions:
      "Pick up the sample in one hand and a same-sized piece of modeling clay in the other. Does the sample feel surprisingly light or surprisingly heavy for its size? Compare to the reference weights provided.",
    safetyTier: "low",
    warning: "No chemicals. Do not drop samples on feet.",
    durationHint: "~20 sec",
    icon: "⚖️",
    options: [
      {
        id: "feels_light",
        label: "Feels light for its size — similar to or lighter than the clay",
        likelihoods: {
          iron: 0.03,
          copper: 0.04,
          zinc: 0.05,
          aluminum: 0.88,
          sulfur: 0.35,
          graphite: 0.40,
          unknown: 0.30,
        },
      },
      {
        id: "feels_heavy",
        label: "Feels heavy for its size — noticeably heavier than the clay",
        likelihoods: {
          iron: 0.97,
          copper: 0.96,
          zinc: 0.95,
          aluminum: 0.12,
          sulfur: 0.65,
          graphite: 0.60,
          unknown: 0.70,
        },
      },
    ],
  },
  {
    id: "color_luster_test",
    name: "Color & Luster Test",
    shortName: "Color",
    instructions:
      "Look at the sample under good lighting. Note the dominant color and whether the surface is shiny/metallic, dull, or has a specific hue.",
    safetyTier: "low",
    warning: "No chemicals needed. Do not rub eyes after handling samples.",
    durationHint: "~15 sec",
    icon: "🎨",
    options: [
      {
        id: "reddish_metallic",
        label: "Reddish / orange-brown and metallic",
        likelihoods: {
          iron: 0.03,
          copper: 0.92,
          zinc: 0.02,
          aluminum: 0.01,
          sulfur: 0.01,
          graphite: 0.01,
          unknown: 0.15,
        },
      },
      {
        id: "bright_yellow",
        label: "Bright yellow, waxy or powdery",
        likelihoods: {
          iron: 0.01,
          copper: 0.01,
          zinc: 0.02,
          aluminum: 0.01,
          sulfur: 0.90,
          graphite: 0.02,
          unknown: 0.15,
        },
      },
      {
        id: "dark_gray_streaky",
        label: "Dark gray or black, leaves marks / looks greasy",
        likelihoods: {
          iron: 0.06,
          copper: 0.01,
          zinc: 0.02,
          aluminum: 0.01,
          sulfur: 0.03,
          graphite: 0.92,
          unknown: 0.15,
        },
      },
      {
        id: "silvery_metallic",
        label: "Silver / gray metallic and shiny",
        likelihoods: {
          iron: 0.90,
          copper: 0.06,
          zinc: 0.94,
          aluminum: 0.97,
          sulfur: 0.06,
          graphite: 0.05,
          unknown: 0.55,
        },
      },
    ],
  },
  {
    id: "scratch_test",
    name: "Fingernail Scratch (Hardness) Test",
    shortName: "Hardness",
    instructions:
      "Try to scratch the surface of the sample firmly with your fingernail. Then try scratching it with the corner of a copper coin. Note whether a scratch mark appears.",
    safetyTier: "low",
    warning: "Scratch gently — do not press so hard you cut yourself. Wash hands after.",
    durationHint: "~20 sec",
    icon: "💅",
    options: [
      {
        id: "fingernail_scratches",
        label: "Fingernail leaves a scratch — sample is soft",
        likelihoods: {
          iron: 0.02,
          copper: 0.03,
          zinc: 0.04,
          aluminum: 0.05,
          sulfur: 0.88,
          graphite: 0.80,
          unknown: 0.25,
        },
      },
      {
        id: "coin_scratches",
        label: "Coin scratches it but fingernail doesn't — medium hardness",
        likelihoods: {
          iron: 0.05,
          copper: 0.10,
          zinc: 0.08,
          aluminum: 0.20,
          sulfur: 0.10,
          graphite: 0.18,
          unknown: 0.30,
        },
      },
      {
        id: "nothing_scratches",
        label: "Neither makes a mark — sample is hard",
        likelihoods: {
          iron: 0.93,
          copper: 0.87,
          zinc: 0.88,
          aluminum: 0.75,
          sulfur: 0.02,
          graphite: 0.02,
          unknown: 0.45,
        },
      },
    ],
  },
  {
    id: "heat_test",
    name: "Heat Conduction Test",
    shortName: "Heat",
    instructions:
      "Hold one end of the sample. Ask an adult to briefly warm the other end with a warm (not hot) mug of water for 10 seconds, then dry it. Place that end against your wrist. Does it feel warm quickly?",
    safetyTier: "medium",
    warning:
      "Adult supervision required. Use warm, not boiling, water. Do not hold the sample if it becomes uncomfortably hot.",
    durationHint: "~30 sec",
    icon: "🌡️",
    options: [
      {
        id: "conducts_heat_fast",
        label: "Wrist feels warm quickly — heat traveled fast",
        likelihoods: {
          iron: 0.88,
          copper: 0.97,
          zinc: 0.85,
          aluminum: 0.92,
          sulfur: 0.04,
          graphite: 0.30,
          unknown: 0.40,
        },
      },
      {
        id: "conducts_heat_slow",
        label: "Stays cool or barely warm — poor heat conductor",
        likelihoods: {
          iron: 0.12,
          copper: 0.03,
          zinc: 0.15,
          aluminum: 0.08,
          sulfur: 0.96,
          graphite: 0.70,
          unknown: 0.60,
        },
      },
    ],
  },
  {
    id: "sound_test",
    name: "Sound / Ring Test",
    shortName: "Ring",
    instructions:
      "Suspend the sample by a piece of string tied loosely around its middle (or balance it on your fingertip). Tap it with the end of a pencil. Listen to the sound it makes.",
    safetyTier: "low",
    warning: "No chemicals. Tap gently to avoid chipping brittle samples.",
    durationHint: "~15 sec",
    icon: "🔔",
    options: [
      {
        id: "clear_ring",
        label: "Clear ringing tone — like a small bell",
        likelihoods: {
          iron: 0.85,
          copper: 0.90,
          zinc: 0.80,
          aluminum: 0.88,
          sulfur: 0.05,
          graphite: 0.08,
          unknown: 0.35,
        },
      },
      {
        id: "dull_thud",
        label: "Dull thud or clunk — no ring",
        likelihoods: {
          iron: 0.15,
          copper: 0.10,
          zinc: 0.20,
          aluminum: 0.12,
          sulfur: 0.95,
          graphite: 0.92,
          unknown: 0.65,
        },
      },
    ],
  },
  {
    id: "streak_test",
    name: "Streak Test",
    shortName: "Streak",
    instructions:
      "Drag the sample firmly across the rough side of the unglazed ceramic tile provided. Look at the color of the mark (streak) it leaves, not the sample itself.",
    safetyTier: "low",
    warning:
      "Handle the tile carefully — edges can be sharp. Wash hands after. The tile may get permanently marked.",
    durationHint: "~20 sec",
    icon: "✏️",
    options: [
      {
        id: "gray_black_streak",
        label: "Gray or black streak on tile",
        likelihoods: {
          iron: 0.20,
          copper: 0.05,
          zinc: 0.06,
          aluminum: 0.05,
          sulfur: 0.03,
          graphite: 0.92,
          unknown: 0.20,
        },
      },
      {
        id: "yellow_streak",
        label: "Yellow or pale yellow streak",
        likelihoods: {
          iron: 0.02,
          copper: 0.02,
          zinc: 0.03,
          aluminum: 0.02,
          sulfur: 0.90,
          graphite: 0.03,
          unknown: 0.15,
        },
      },
      {
        id: "no_streak",
        label: "No visible colored streak — tile looks unchanged",
        likelihoods: {
          iron: 0.78,
          copper: 0.93,
          zinc: 0.91,
          aluminum: 0.93,
          sulfur: 0.07,
          graphite: 0.05,
          unknown: 0.65,
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
