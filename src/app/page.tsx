"use client";

import { useState } from "react";
import DropZone from "@/components/DropZone";
import ResultsPanel from "@/components/ResultsPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AnalysisResult } from "@/lib/types";
import { FileText, Zap, ShieldCheck, Target } from "lucide-react";

type State = "idle" | "loading" | "results" | "error";

const FEATURES = [
  { icon: Target, label: "ATS Score", desc: "0–100 compatibility rating" },
  { icon: ShieldCheck, label: "Gap Analysis", desc: "Missing keywords detected" },
  { icon: Zap, label: "AI Feedback", desc: "Section-by-section review" },
  { icon: FileText, label: "Roadmap", desc: "Prioritized improvements" },
];

export default function Home() {
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setState("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis failed");
      }

      setResult(json.data);
      setState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-paper">
      {/* Nav */}
      <nav className="border-b border-border bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
              <span className="text-accent font-display font-bold text-xs">R</span>
            </div>
            <span className="font-display font-semibold text-ink text-base tracking-tight">
              ResumeIQ
            </span>
          </div>
          <span className="text-xs font-mono text-muted bg-cream px-3 py-1 rounded-full border border-border">
            AI-Powered
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero — only show on idle/error */}
        {(state === "idle" || state === "error") && (
          <div className="text-center mb-14">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-ink rounded-full px-4 py-1.5 text-xs font-mono mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Free ATS Scanner — No sign up required
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl text-ink leading-[1.05] tracking-tight mb-4">
              Will your resume
              <br />
              <span className="relative inline-block">
                pass the ATS
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q25 1 50 4 Q75 7 100 3"
                    fill="none"
                    stroke="#C8FF00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              {" "}filter?
            </h1>

            <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed mb-12">
              Upload your PDF resume and get an instant AI analysis — ATS score,
              missing keywords, and a step-by-step improvement plan.
            </p>

            {/* Feature pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-14">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/50 border border-border hover:border-ink/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-ink/5 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-ink" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-xs text-ink">{label}</p>
                    <p className="text-muted text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="max-w-md mx-auto mb-8 px-4 py-3 bg-danger/8 border border-danger/20 rounded-xl text-danger text-sm font-medium">
                ⚠ {error}
              </div>
            )}

            <DropZone onUpload={handleUpload} isLoading={false} />
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="max-w-lg mx-auto">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {state === "results" && result && (
          <ResultsPanel result={result} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-display font-semibold text-ink text-sm">ResumeIQ</span>
          <p className="text-muted text-xs font-mono">
            Powered by GPT-4o · pdf-parse · Next.js 14
          </p>
        </div>
      </footer>
    </main>
  );
}
