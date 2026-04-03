"use client";

import { useEffect, useState } from "react";
import { SectionScore } from "@/lib/types";

interface SectionScoresProps {
  sections: SectionScore[];
}

export default function SectionScores({ sections }: SectionScoresProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const getBarColor = (pct: number) => {
    if (pct >= 85) return "#00C896";
    if (pct >= 70) return "#C8FF00";
    if (pct >= 50) return "#FF9B21";
    return "#FF4444";
  };

  return (
    <div className="space-y-4">
      {sections.map((s, i) => {
        const pct = Math.round((s.score / s.maxScore) * 100);
        const color = getBarColor(pct);
        return (
          <div key={s.section} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-ink">{s.section}</span>
              <span className="font-mono text-muted text-xs">
                {s.score}/{s.maxScore}
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: animated ? `${pct}%` : "0%",
                  backgroundColor: color,
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
