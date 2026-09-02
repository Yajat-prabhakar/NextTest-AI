"use client";

import { useEffect, useState } from "react";
import { ConfidenceTubes } from "./ConfidenceTubes";
import type { Distribution } from "@/lib/bayes";

const dist1: Distribution = { iron: 0.6, copper: 0.2, zinc: 0.1, aluminum: 0.05, sulfur: 0.0, graphite: 0.0, unknown: 0.05 };
const dist2: Distribution = { iron: 0.3, copper: 0.6, zinc: 0.05, aluminum: 0.0, sulfur: 0.0, graphite: 0.05, unknown: 0.0 };
const dist3: Distribution = { iron: 0.05, copper: 0.9, zinc: 0.05, aluminum: 0.0, sulfur: 0.0, graphite: 0.0, unknown: 0.0 };

const seq = [dist1, dist2, dist3, dist2];

export function AnimatedPreview() {
  const [dist, setDist] = useState<Distribution>(dist1);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setDist(seq[i]);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 p-4 bg-white rounded-lg flex flex-col justify-center">
      <div className="text-center mb-2">
        <span className="font-bold text-xs" style={{ fontFamily: "var(--font-quicksand)" }}>
          LIVE CONFIDENCE
        </span>
      </div>
      <div className="scale-75 origin-center">
        <ConfidenceTubes distribution={dist} />
      </div>
    </div>
  );
}
