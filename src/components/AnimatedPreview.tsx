"use client";

import { useEffect, useState } from "react";
import { ConfidenceTubes } from "./ConfidenceTubes";
import type { Distribution } from "@/lib/bayes";

const seq: Distribution[] = [
  { iron: 0.55, copper: 0.22, zinc: 0.08, aluminum: 0.07, sulfur: 0.02, graphite: 0.02, unknown: 0.04 },
  { iron: 0.22, copper: 0.58, zinc: 0.08, aluminum: 0.05, sulfur: 0.02, graphite: 0.02, unknown: 0.03 },
  { iron: 0.05, copper: 0.85, zinc: 0.04, aluminum: 0.03, sulfur: 0.01, graphite: 0.01, unknown: 0.01 },
];

export function AnimatedPreview() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % seq.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 bg-white rounded-lg flex flex-col p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
          Live Confidence
        </span>
        <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-full text-xs font-bold animate-pulse">
          Updating…
        </span>
      </div>
      <div className="flex-1 flex items-end">
        <ConfidenceTubes distribution={seq[idx]} compact />
      </div>
    </div>
  );
}
