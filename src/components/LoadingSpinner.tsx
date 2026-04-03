"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Extracting resume content...",
  "Parsing structure & sections...",
  "Running ATS keyword analysis...",
  "Scoring with AI model...",
  "Generating feedback...",
  "Finalizing your report...",
];

export default function LoadingSpinner() {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2500);

    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);

    return () => {
      clearInterval(stepTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* Animated logo mark */}
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <svg
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "3s" }}
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#E2DDD4"
            strokeWidth="4"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#C8FF00"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="213.6"
            strokeDashoffset="160"
          />
        </svg>

        {/* Inner ring (opposite spin) */}
        <svg
          className="absolute inset-2 animate-spin"
          style={{ animationDuration: "2s", animationDirection: "reverse" }}
          viewBox="0 0 64 64"
        >
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#E2DDD4"
            strokeWidth="3"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#0A0A0F"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="163.4"
            strokeDashoffset="120"
          />
        </svg>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-ink animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-display font-semibold text-xl text-ink">
          Analyzing your resume{dots}
        </h3>
        <p className="text-muted text-sm font-mono min-h-[20px] transition-all">
          {STEPS[step]}
        </p>
      </div>

      {/* Step progress */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i === step ? "24px" : "6px",
              backgroundColor: i <= step ? "#0A0A0F" : "#E2DDD4",
            }}
          />
        ))}
      </div>
    </div>
  );
}
