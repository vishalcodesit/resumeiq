export interface AnalysisResult {
  atsScore: number;
  scoreLabel: string;
  summary: string;
  strengths: string[];
  feedback: FeedbackItem[];
  missingKeywords: string[];
  improvements: Improvement[];
  sectionScores: SectionScore[];
}

export interface FeedbackItem {
  category: string;
  issue: string;
  impact: "high" | "medium" | "low";
}

export interface Improvement {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface SectionScore {
  section: string;
  score: number;
  maxScore: number;
}
