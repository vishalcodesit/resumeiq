"use client";

import { JobMatch } from "@/lib/types";
import { Briefcase, Check, X, PenLine } from "lucide-react";

interface JobMatchCardProps {
  match: JobMatch;
}

const getMatchColor = (s: number) => {
  if (s >= 80) return "#00C896";
  if (s >= 60) return "#A8D400";
  if (s >= 40) return "#FF9B21";
  return "#FF4444";
};

export default function JobMatchCard({ match }: JobMatchCardProps) {
  const color = getMatchColor(match.matchScore);

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-5 animate-slide-up stagger-1">
      {/* Header + score */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-ink" />
            <h3 className="font-display font-semibold text-ink">Job Match</h3>
          </div>
          {match.jobTitle && (
            <p className="text-sm font-mono text-muted truncate">{match.jobTitle}</p>
          )}
          {match.summary && <p className="text-ink leading-relaxed mt-3">{match.summary}</p>}
          {match.experienceFit && (
            <p className="text-sm text-muted leading-snug mt-2">{match.experienceFit}</p>
          )}
        </div>

        <div className="shrink-0 sm:w-44 rounded-xl p-4 text-center" style={{ background: `${color}14` }}>
          <span className="font-display font-bold text-4xl leading-none" style={{ color }}>
            {match.matchScore}%
          </span>
          <p className="font-display font-semibold text-sm mt-1" style={{ color }}>
            {match.matchLabel}
          </p>
          <div className="h-1.5 bg-border rounded-full overflow-hidden mt-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${match.matchScore}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkillList
          title="Matched Skills"
          items={match.matchedSkills}
          empty="No required skills clearly matched."
          icon={<Check className="w-3 h-3" />}
          className="bg-success/10 text-success border-success/20"
        />
        <SkillList
          title="Missing Skills"
          items={match.missingSkills}
          empty="No major gaps found."
          icon={<X className="w-3 h-3" />}
          className="bg-danger/[0.08] text-danger border-danger/20"
        />
      </div>

      {/* Tailoring tips */}
      {match.tailoringTips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-3.5 h-3.5 text-ink" />
            <h4 className="font-display font-semibold text-sm text-ink">Tailor Your Resume for This Job</h4>
          </div>
          <ol className="space-y-2">
            {match.tailoringTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-md bg-ink text-accent font-mono text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-ink/80 leading-snug">{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function SkillList({
  title,
  items,
  empty,
  icon,
  className,
}: {
  title: string;
  items: string[];
  empty: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-mono font-medium text-muted uppercase tracking-wide">{title}</h4>
        <span className="text-xs font-mono text-muted bg-ink/5 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((s, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${className}`}
            >
              {icon}
              {s}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}
