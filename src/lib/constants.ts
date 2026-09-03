export const ELEMENT_IDS = [
  "iron",
  "copper",
  "zinc",
  "aluminum",
  "sulfur",
  "graphite",
  "unknown",
] as const;

export type ElementId = (typeof ELEMENT_IDS)[number];

/**
 * The 6 identifiable elements — never includes "unknown".
 * Use this set for final-answer argmax so "unknown" can never win.
 */
export const REAL_ELEMENT_IDS = [
  "iron",
  "copper",
  "zinc",
  "aluminum",
  "sulfur",
  "graphite",
] as const satisfies ReadonlyArray<ElementId>;

export type RealElementId = (typeof REAL_ELEMENT_IDS)[number];

/**
 * Minimum expected-information-gain (in bits) for an experiment to be
 * considered worth running. When the best remaining experiment falls
 * below this threshold the loop stops — evidence has plateaued.
 * Tuned to 0.03 via Monte-Carlo simulation (see HackTheStack report).
 */
export const EPSILON = 0.03;

export const ELEMENT_LABELS: Record<ElementId, string> = {
  iron: "Iron (Fe)",
  copper: "Copper (Cu)",
  zinc: "Zinc (Zn)",
  aluminum: "Aluminum (Al)",
  sulfur: "Sulfur (S)",
  graphite: "Graphite / Carbon (C)",
  unknown: "Unknown — not in kit",
};

export const ELEMENT_SHORT_LABELS: Record<ElementId, string> = {
  iron: "Iron",
  copper: "Copper",
  zinc: "Zinc",
  aluminum: "Aluminum",
  sulfur: "Sulfur",
  graphite: "Graphite",
  unknown: "Unknown",
};

export const ELEMENT_COLORS: Record<ElementId, string> = {
  iron: "#6b7280",
  copper: "#c17c37",
  zinc: "#9ca3af",
  aluminum: "#d1d5db",
  sulfur: "#eab308",
  graphite: "#374151",
  unknown: "#8b5cf6",
};

export const DEFAULT_THRESHOLD = 0.85;
