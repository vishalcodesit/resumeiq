import Groq from "groq-sdk";
import { AnalysisResult, FeedbackItem, Improvement, JobMatch, Level, MAX_JD_CHARS, SectionScore } from "./types";

export const DEFAULT_MODEL = "openai/gpt-oss-120b";

// Keeps the prompt well inside Groq's free-tier tokens-per-minute limits.
const MAX_RESUME_CHARS = 12000;

let client: Groq | null = null;

// Created lazily so a missing key doesn't crash the build or module import.
function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured. Add it to .env.local.");
  if (!client) client = new Groq({ apiKey });
  return client;
}

const SECTIONS: { section: string; maxScore: number }[] = [
  { section: "Contact Information", maxScore: 20 },
  { section: "Work Experience", maxScore: 35 },
  { section: "Skills & Keywords", maxScore: 25 },
  { section: "Education", maxScore: 10 },
  { section: "Formatting & Structure", maxScore: 10 },
];

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer and professional resume coach with 15+ years of HR and recruiting experience.

Analyze the provided resume text and return a detailed JSON analysis. Be honest, specific, and actionable.

Return ONLY valid JSON with this exact structure, no markdown, no backticks, just raw JSON:
{
  "atsScore": <number 0-100>,
  "scoreLabel": <"Excellent" | "Good" | "Fair" | "Poor">,
  "summary": <2-3 sentence overall assessment>,
  "strengths": [<3-5 specific strengths as strings>],
  "feedback": [
    {
      "category": <string like "Contact Info", "Work Experience", "Skills", "Education", "Formatting">,
      "issue": <specific actionable issue>,
      "impact": <"high" | "medium" | "low">
    }
  ],
  "missingKeywords": [<10-15 important ATS keywords/skills missing from resume>],
  "improvements": [
    {
      "title": <short improvement title>,
      "description": <specific, actionable improvement description>,
      "priority": <"high" | "medium" | "low">
    }
  ],
  "sectionScores": [
    { "section": "Contact Information", "score": <0-20>, "maxScore": 20 },
    { "section": "Work Experience", "score": <0-35>, "maxScore": 35 },
    { "section": "Skills & Keywords", "score": <0-25>, "maxScore": 25 },
    { "section": "Education", "score": <0-10>, "maxScore": 10 },
    { "section": "Formatting & Structure", "score": <0-10>, "maxScore": 10 }
  ]
}

ATS Score Guidelines:
- 85-100: Excellent - Highly ATS-optimized
- 70-84: Good - Minor improvements needed
- 50-69: Fair - Significant gaps to address
- 0-49: Poor - Major overhaul required

Provide 5-7 feedback items and 4-6 improvement suggestions. Return ONLY the JSON object, nothing else.`;

const JOB_MATCH_PROMPT = `

A JOB DESCRIPTION is also provided. Evaluate the resume against that specific role:
- "missingKeywords" must list keywords and skills from the job description that the resume lacks.
- "feedback" and "improvements" should focus on closing the gap to this job.
- Add a "jobMatch" field to the JSON object:
  "jobMatch": {
    "matchScore": <number 0-100, how well the candidate fits this specific job>,
    "jobTitle": <job title inferred from the job description>,
    "summary": <2-3 sentence assessment of fit for this role>,
    "matchedSkills": [<required/preferred skills from the JD that the resume demonstrates>],
    "missingSkills": [<required/preferred skills from the JD absent from the resume, most important first>],
    "experienceFit": <1-2 sentences comparing the candidate's experience level and domain to what the JD asks for>,
    "tailoringTips": [<4-6 specific edits to tailor this resume to this job, referencing actual resume content>]
  }
Only count a skill as matched if the resume gives evidence for it. Be strict and honest with matchScore.`;

export async function analyzeResume(resumeText: string, jobDescription?: string): Promise<AnalysisResult> {
  const text = clean(resumeText).slice(0, MAX_RESUME_CHARS);
  const jd = jobDescription ? clean(jobDescription).slice(0, MAX_JD_CHARS) : "";

  const userContent = jd
    ? `RESUME:\n\n${text}\n\n---\n\nJOB DESCRIPTION:\n\n${jd}`
    : `Analyze this resume:\n\n${text}`;

  let content: string | null | undefined;
  try {
    const response = await getClient().chat.completions.create({
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
      messages: [
        { role: "system", content: jd ? SYSTEM_PROMPT + JOB_MATCH_PROMPT : SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      // GPT-OSS is a reasoning model; its reasoning tokens count toward this limit.
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });
    content = response.choices[0]?.message?.content;
  } catch (error) {
    throw new Error(describeGroqError(error));
  }

  if (!content) throw new Error("Empty response from Groq. Please try again.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("AI returned an invalid response. Please try again.");
  }
  return normalize(parsed, Boolean(jd));
}

function clean(s: string): string {
  return s.replace(/\s+\n/g, "\n").trim();
}

function describeGroqError(error: unknown): string {
  if (error instanceof Groq.APIError) {
    if (error.status === 401) return "Invalid Groq API key. Check GROQ_API_KEY in .env.local.";
    if (error.status === 429) return "Groq rate limit reached. Wait a minute and try again.";
    if (error.status === 404) return "Groq model not found. Check GROQ_MODEL in .env.local.";
    if (error.status && error.status >= 500) return "Groq service is unavailable. Try again shortly.";
    return `Groq API error: ${error.message}`;
  }
  return error instanceof Error ? error.message : "Analysis failed";
}

// LLM output is untrusted: coerce it into the shape the UI expects.
function normalize(raw: unknown, withJobMatch: boolean): AnalysisResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const atsScore = clamp(Math.round(num(r.atsScore)), 0, 100);

  const rawSections = Array.isArray(r.sectionScores) ? r.sectionScores : [];
  const sectionScores: SectionScore[] = SECTIONS.map(({ section, maxScore }, i) => {
    const match =
      rawSections.find((s) => str(s?.section).toLowerCase() === section.toLowerCase()) ??
      rawSections[i];
    return { section, maxScore, score: clamp(Math.round(num(match?.score)), 0, maxScore) };
  });

  const feedback: FeedbackItem[] = arr(r.feedback)
    .map((f) => ({ category: str(f?.category) || "General", issue: str(f?.issue), impact: level(f?.impact) }))
    .filter((f) => f.issue);

  const improvements: Improvement[] = arr(r.improvements)
    .map((m) => ({ title: str(m?.title), description: str(m?.description), priority: level(m?.priority) }))
    .filter((m) => m.title || m.description);

  return {
    atsScore,
    scoreLabel: scoreLabel(atsScore),
    summary: str(r.summary),
    strengths: arr(r.strengths).map(str).filter(Boolean),
    feedback,
    missingKeywords: arr(r.missingKeywords).map(str).filter(Boolean),
    improvements,
    sectionScores,
    ...(withJobMatch && { jobMatch: normalizeJobMatch(r.jobMatch) }),
  };
}

function normalizeJobMatch(raw: unknown): JobMatch {
  const j = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const matchScore = clamp(Math.round(num(j.matchScore)), 0, 100);
  return {
    matchScore,
    matchLabel: matchLabel(matchScore),
    jobTitle: str(j.jobTitle),
    summary: str(j.summary),
    matchedSkills: arr(j.matchedSkills).map(str).filter(Boolean),
    missingSkills: arr(j.missingSkills).map(str).filter(Boolean),
    experienceFit: str(j.experienceFit),
    tailoringTips: arr(j.tailoringTips).map(str).filter(Boolean),
  };
}

function matchLabel(score: number): string {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Weak Match";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function level(v: unknown): Level {
  const s = str(v).toLowerCase();
  return s === "high" || s === "low" ? s : "medium";
}

function arr(v: unknown): any[] {
  return Array.isArray(v) ? v : [];
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(str(v));
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
