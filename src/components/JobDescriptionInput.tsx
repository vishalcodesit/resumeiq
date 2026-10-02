"use client";

import { useState } from "react";
import { Briefcase, ChevronDown, X } from "lucide-react";
import clsx from "clsx";
import { MAX_JD_CHARS } from "@/lib/types";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  const [open, setOpen] = useState(value.length > 0);

  return (
    <div className="border border-border rounded-2xl bg-white/50 text-left overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-cream/40 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-ink/5 flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-ink" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-display font-semibold text-sm text-ink">
            Match against a job description
            <span className="ml-2 text-xs font-mono font-normal text-muted">optional</span>
          </p>
          <p className="text-muted text-xs">
            {value.trim()
              ? `${value.trim().length.toLocaleString()} characters added`
              : "Paste a job posting to get a match score and tailored suggestions"}
          </p>
        </div>
        <ChevronDown
          className={clsx("w-4 h-4 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={MAX_JD_CHARS}
            rows={8}
            placeholder="Paste the full job description here: title, responsibilities, required and preferred skills..."
            className="w-full resize-y rounded-xl border border-border bg-paper/60 px-4 py-3 text-sm text-ink
              placeholder:text-muted/70 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/40"
          />
          <div className="flex items-center justify-between text-xs text-muted font-mono">
            <span>
              {value.length.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
            </span>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex items-center gap-1 hover:text-danger transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
