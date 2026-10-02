// Job descriptions longer than this are truncated before being sent to Groq.
export const MAX_JD_CHARS = 8000;

export type Level = "high" | "medium" | "low";

export interface AnalysisResult {
  atsScore: number;
  scoreLabel: string;
  summary: string;
  strengths: string[];
  feedback: FeedbackItem[];
  missingKeywords: string[];
  improvements: Improvement[];
  sectionScores: SectionScore[];
  jobMatch?: JobMatch;
}

// Present only when a job description was submitted with the resume.
export interface JobMatch {
  matchScore: number;
  matchLabel: string;
  jobTitle: string;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  experienceFit: string;
  tailoringTips: string[];
}

export interface FeedbackItem {
  category: string;
  issue: string;
  impact: Level;
}

export interface Improvement {
  title: string;
  description: string;
  priority: Level;
}

export interface SectionScore {
  section: string;
  score: number;
  maxScore: number;
}
