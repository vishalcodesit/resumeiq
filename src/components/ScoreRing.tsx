"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface ScoreRingProps {
  score: number;
  label: string;
}

export default function ScoreRing({ score, label }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [ringProgress, setRingProgress] = useState(0);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 85) return "#00C896";
    if (s >= 70) return "#C8FF00";
    if (s >= 50) return "#FF9B21";
    return "#FF4444";
  };

  const getScoreBg = (s: number) => {
    if (s >= 85) return "rgba(0,200,150,0.08)";
    if (s >= 70) return "rgba(200,255,0,0.08)";
    if (s >= 50) return "rgba(255,155,33,0.08)";
    return "rgba(255,68,68,0.08)";
  };

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        setRingProgress(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
        setRingProgress(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const color = getScoreColor(score);
  const bg = getScoreBg(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-36 h-36 rounded-full flex items-center justify-center"
        style={{ background: bg }}
      >
        <svg
          width="144"
          height="144"
          viewBox="0 0 144 144"
          className="absolute inset-0 score-ring"
        >
          {/* Background track */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          {/* Progress arc */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.05s ease-out" }}
          />
        </svg>

        <div className="relative z-10 text-center">
          <span
            className="font-display font-bold text-4xl leading-none block"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs font-mono text-muted tracking-widest uppercase">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p
          className={clsx(
            "font-display font-semibold text-lg px-4 py-1 rounded-full",
          )}
          style={{ color, background: bg }}
        >
          {label}
        </p>
        <p className="text-muted text-sm mt-1 font-body">ATS Compatibility Score</p>
      </div>
    </div>
  );
}
