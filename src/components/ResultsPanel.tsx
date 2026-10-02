"use client";

import { AnalysisResult } from "@/lib/types";
import ScoreRing from "./ScoreRing";
import SectionScores from "./SectionScores";
import JobMatchCard from "./JobMatchCard";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Tag,
  ArrowUp,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";

interface ResultsPanelProps {
  result: AnalysisResult;
  onReset: () => void;
}

const impactConfig = {
  high: { label: "High Impact", color: "text-danger", bg: "bg-danger/[0.08]", icon: AlertCircle },
  medium: { label: "Medium", color: "text-warning", bg: "bg-warning/[0.08]", icon: AlertTriangle },
  low: { label: "Low", color: "text-muted", bg: "bg-ink/5", icon: AlertCircle },
};

const priorityConfig = {
  high: { dot: "bg-danger", label: "High Priority" },
  medium: { dot: "bg-warning", label: "Medium Priority" },
  low: { dot: "bg-success", label: "Low Priority" },
};

export default function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-ink">Your Analysis</h2>
          <p className="text-muted text-sm mt-0.5">AI-powered ATS & Resume Feedback</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors 
            px-4 py-2 rounded-xl border border-border hover:border-ink/20 hover:bg-cream/60"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New scan
        </button>
      </div>

      {result.jobMatch && <JobMatchCard match={result.jobMatch} />}

      {/* Score + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
        {/* Score Card */}
        <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col items-center justify-center min-w-[200px] animate-slide-up stagger-1">
          <ScoreRing score={result.atsScore} label={result.scoreLabel} />
        </div>

        {/* Summary + Section Scores */}
        <div className="space-y-4">
          <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 animate-slide-up stagger-2">
            <h3 className="font-display font-semibold text-sm text-muted uppercase tracking-wider mb-2">
              Overview
            </h3>
            <p className="text-ink leading-relaxed">{result.summary}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 animate-slide-up stagger-3">
            <h3 className="font-display font-semibold text-sm text-muted uppercase tracking-wider mb-4">
              Section Breakdown
            </h3>
            <SectionScores sections={result.sectionScores} />
          </div>
        </div>
      </div>

      {/* Strengths */}
      {result.strengths && result.strengths.length > 0 && (
        <div className="bg-success/5 border border-success/20 rounded-2xl p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h3 className="font-display font-semibold text-success">What&apos;s Working Well</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                <span className="text-ink/80">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two column: Feedback + Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Issues */}
        <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-ink" />
            <h3 className="font-display font-semibold text-ink">Issues Found</h3>
            <span className="ml-auto text-xs font-mono text-muted bg-ink/5 px-2 py-0.5 rounded-full">
              {result.feedback.length}
            </span>
          </div>
          <div className="space-y-3">
            {result.feedback.map((f, i) => {
              const config = impactConfig[f.impact] ?? impactConfig.medium;
              const Icon = config.icon;
              return (
                <div key={i} className={clsx("rounded-xl p-3.5", config.bg)}>
                  <div className="flex items-start gap-2.5">
                    <Icon className={clsx("w-3.5 h-3.5 mt-0.5 shrink-0", config.color)} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-muted uppercase tracking-wide">
                          {f.category}
                        </span>
                        <span className={clsx("text-xs font-medium", config.color)}>
                          · {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-ink/85 mt-0.5 leading-snug">{f.issue}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 animate-slide-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-ink" />
            <h3 className="font-display font-semibold text-ink">Missing Keywords</h3>
            <span className="ml-auto text-xs font-mono text-muted bg-ink/5 px-2 py-0.5 rounded-full">
              {result.missingKeywords.length}
            </span>
          </div>
          <p className="text-xs text-muted mb-3">
            {result.jobMatch
              ? "Terms from the job description your resume doesn't include:"
              : "Add these ATS-critical terms to increase your score:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-ink/5 hover:bg-ink/10 text-ink text-sm font-mono rounded-lg 
                  border border-ink/[0.08] cursor-default transition-colors"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 animate-slide-up stagger-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-ink" />
          <h3 className="font-display font-semibold text-ink">Improvement Roadmap</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.improvements.map((imp, i) => {
            const p = priorityConfig[imp.priority] ?? priorityConfig.medium;
            return (
              <div
                key={i}
                className="border border-border rounded-xl p-4 hover:border-ink/20 hover:bg-cream/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-3.5 h-3.5 text-ink/40" />
                  <span className="font-display font-semibold text-sm text-ink">{imp.title}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className={clsx("w-1.5 h-1.5 rounded-full", p.dot)} />
                    <span className="text-xs text-muted">{p.label}</span>
                  </div>
                </div>
                <p className="text-sm text-muted leading-snug">{imp.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-ink text-paper rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up stagger-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-base">Ready to improve your score?</h3>
          </div>
          <p className="text-paper/60 text-sm">
            Apply the suggestions above and re-scan your updated resume.
          </p>
        </div>
        <button
          onClick={onReset}
          className="shrink-0 px-6 py-3 bg-accent text-ink rounded-xl font-display font-semibold 
            text-sm hover:bg-accent/90 transition-colors active:scale-95"
        >
          Scan Updated Resume
        </button>
      </div>
    </div>
  );
}
