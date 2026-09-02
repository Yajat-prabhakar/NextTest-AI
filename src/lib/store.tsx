"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Distribution, EvidenceEntry } from "./bayes";
import { DEFAULT_THRESHOLD } from "./constants";

export type SampleStatus = "new" | "in_progress" | "solved";

export interface SampleState {
  status: SampleStatus;
  imageDataUrl: string | null;
  distribution: Distribution | null;
  visionRaw: unknown | null;
  completed: string[];
  trail: EvidenceEntry[];
  nextExpId: string | null;
  whyExplanation: string | null;
  // Indexed by round number — each completed step stores its "what it means" explanation
  whatExplanations: Record<number, string>;
  finished: boolean;
  identifiedElementId: string | null;
  dateSolved?: string;
}

export interface LabContextType {
  samples: Record<string, SampleState>;
  threshold: number;
  setThreshold: (val: number) => void;
  updateSample: (id: string, update: Partial<SampleState>) => void;
  resetSample: (id: string) => void;
}

const defaultSampleState: SampleState = {
  status: "new",
  imageDataUrl: null,
  distribution: null,
  visionRaw: null,
  completed: [],
  trail: [],
  nextExpId: null,
  whyExplanation: null,
  whatExplanations: {},
  finished: false,
  identifiedElementId: null,
};

const LabContext = createContext<LabContextType | undefined>(undefined);

const initialSamples: Record<string, SampleState> = {
  "1": { ...defaultSampleState },
  "2": { ...defaultSampleState },
  "3": { ...defaultSampleState },
  "4": { ...defaultSampleState },
  "5": { ...defaultSampleState },
  "6": { ...defaultSampleState },
};

export function LabProvider({ children }: { children: ReactNode }) {
  const [samples, setSamples] = useState<Record<string, SampleState>>(initialSamples);
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);

  const updateSample = (id: string, update: Partial<SampleState>) => {
    setSamples((prev) => {
      const current = prev[id] || defaultSampleState;

      let status = current.status;
      const isFinished = update.finished !== undefined ? update.finished : current.finished;
      const hasDistribution = update.distribution !== undefined ? update.distribution : current.distribution;

      if (isFinished) {
        status = "solved";
      } else if (hasDistribution) {
        status = "in_progress";
      } else {
        status = "new";
      }

      return {
        ...prev,
        [id]: {
          ...current,
          ...update,
          status,
        },
      };
    });
  };

  const resetSample = (id: string) => {
    setSamples((prev) => ({
      ...prev,
      [id]: { ...defaultSampleState },
    }));
  };

  return (
    <LabContext.Provider value={{ samples, threshold, setThreshold, updateSample, resetSample }}>
      {children}
    </LabContext.Provider>
  );
}

export function useLabContext() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error("useLabContext must be used within a LabProvider");
  }
  return context;
}
