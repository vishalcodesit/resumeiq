# ResumeIQ — AI Resume Feedback & ATS Scanner

A full-stack Next.js 14 application that analyzes PDF resumes using the [Groq API](https://console.groq.com) (Llama 3.3 70B). Get an ATS compatibility score, keyword gap analysis, and actionable improvement suggestions in seconds — and optionally paste a job description to see how well your resume matches a specific role.

---

## Features

- **ATS Score (0–100)** — Instant compatibility rating with animated score ring
- **Job Description Matching** — Paste a job posting to get a match score, matched/missing skills, and tailoring tips
- **Section Breakdown** — Scores for Contact Info, Experience, Skills, Education, Formatting
- **Keyword Gap Analysis** — Missing ATS-critical terms you should add
- **Issue Detection** — Categorized problems with High / Medium / Low impact labels
- **Improvement Roadmap** — Prioritized, actionable suggestions
- **Drag & Drop Upload** — PDF-only, up to 10MB
- **Animated Loading States** — Step-by-step progress feedback

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| PDF Parsing | unpdf (pdf.js) |
| AI Analysis | Groq API (`groq-sdk`, Llama 3.3 70B) |
| Animations | CSS keyframes |
| File Upload | react-dropzone |
| Icons | lucide-react |
| Language | TypeScript |

---

## Project Structure

```
resumeiq/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts        # POST /api/analyze — PDF parsing + Groq
│   │   ├── globals.css             # Tailwind + custom fonts + CSS variables
│   │   ├── layout.tsx              # Root layout with metadata
│   │   └── page.tsx                # Main page (upload → loading → results)
│   ├── components/
│   │   ├── DropZone.tsx            # Drag & drop PDF uploader
│   │   ├── JobDescriptionInput.tsx # Optional job description textarea
│   │   ├── JobMatchCard.tsx        # Job match score, skills, tailoring tips
│   │   ├── LoadingSpinner.tsx      # Animated multi-step loader
│   │   ├── ResultsPanel.tsx        # Full results dashboard
│   │   ├── ScoreRing.tsx           # Animated SVG score ring
│   │   └── SectionScores.tsx      # Animated progress bars
│   └── lib/
│       ├── groq.ts                 # Groq client, system prompt, response validation
│       └── types.ts                # TypeScript interfaces
├── .env.local.example              # GROQ_API_KEY template
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Setup

### Prerequisites

- **Node.js** v22 or later (required by `unpdf`)
- **npm** v9+ (or yarn / pnpm)
- A free **Groq API key** — get one at https://console.groq.com/keys

---

### Step 1 — Clone / Download

```bash
# If using git
git clone https://github.com/vishalcodesit/resumeiq.git
cd resumeiq
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Open `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
# Optional — defaults to llama-3.3-70b-versatile
# GROQ_MODEL=llama-3.3-70b-versatile
```

> **Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### Step 4 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Drop a PDF resume** onto the upload area (or click to browse)
2. *(Optional)* Open **"Match against a job description"** and paste the job posting
3. Click **"Analyze My Resume"** (or **"Analyze & Match to Job"** when a JD is added)
4. Review your **ATS score**, **feedback**, **missing keywords**, and **improvements**, plus the **Job Match** card when a JD was provided
5. Click **"New scan"** to analyze another resume

---

## Job Description Matching

Paste a job posting into the optional **"Match against a job description"** panel before analyzing. The resume and job description are sent to Groq together, and the results include a **Job Match** card with:

- **Match score (0–100)**, labeled Strong / Good / Partial / Weak Match
- **Matched skills**: requirements from the posting that the resume shows evidence for
- **Missing skills**: requirements from the posting that the resume lacks, most important first
- **Experience fit**: how your seniority and domain compare to what the role asks for
- **Tailoring tips**: specific edits to make the resume fit this job

With a job description, the **Missing Keywords** list and the feedback also focus on that role rather than general ATS advice. The job description is kept after **"New scan"**, so you can re-check an updated resume against the same posting.

---

## API Route

### `POST /api/analyze`

Accepts a `multipart/form-data` request with a `resume` field containing a PDF file, and an optional `jobDescription` text field (at least 50 characters; truncated to 8,000).

**Request:**
```
Content-Type: multipart/form-data
Body: resume=<PDF file>, jobDescription=<optional text>
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "atsScore": 72,
    "scoreLabel": "Good",
    "summary": "...",
    "strengths": ["..."],
    "feedback": [
      { "category": "Skills", "issue": "...", "impact": "high" }
    ],
    "missingKeywords": ["Python", "Agile", "..."],
    "improvements": [
      { "title": "...", "description": "...", "priority": "high" }
    ],
    "sectionScores": [
      { "section": "Work Experience", "score": 28, "maxScore": 35 }
    ],
    "jobMatch": {
      "matchScore": 64,
      "matchLabel": "Good Match",
      "jobTitle": "Senior Frontend Engineer",
      "summary": "...",
      "matchedSkills": ["React", "TypeScript"],
      "missingSkills": ["GraphQL", "Kubernetes"],
      "experienceFit": "...",
      "tailoringTips": ["..."]
    }
  }
}
```

`jobMatch` is only present when a `jobDescription` was sent.

**Error Response:**
```json
{ "error": "Only PDF files are supported" }
```

---

## Customization

### Swap Groq model
Set `GROQ_MODEL` in `.env.local` to any chat model from https://console.groq.com/docs/models, e.g.:
```env
GROQ_MODEL=llama-3.3-70b-versatile   # Default — best quality
GROQ_MODEL=llama-3.1-8b-instant      # Fastest, lighter analysis
```

### Adjust scoring weights
Edit the `SYSTEM_PROMPT` in `src/lib/groq.ts` to change how sections are weighted or what keywords the AI prioritizes. Job-match behavior is controlled by `JOB_MATCH_PROMPT` in the same file.

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable in Vercel dashboard:
# GROQ_API_KEY = gsk_...
```

Or connect your GitHub repo to Vercel and set `GROQ_API_KEY` in **Project Settings → Environment Variables**.

> Set the function max duration to 60s in Vercel for large resumes: add `export const maxDuration = 60` in the route (already included).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `GROQ_API_KEY is not configured` | Create `.env.local` with the key, then restart `npm run dev` |
| `Invalid Groq API key` | Regenerate the key at console.groq.com/keys |
| `Groq rate limit reached` | Free tier limit hit — wait a minute and retry |
| `Groq model not found` | Set `GROQ_MODEL` to a model listed at console.groq.com/docs/models |
| `Could not extract text from PDF` | Resume is a scanned image — use a text-based PDF |
| `Failed to parse PDF` | The file is corrupted or password-protected — re-export it as a PDF |
| `Job description is too short` | Paste the full job posting (50+ characters) or leave the field empty |
| `Analysis failed` | Check the server console for the underlying error |
| `npm install` fails | Ensure Node.js v22+ is installed (`node --version`) |
| Port 3000 in use | Run `npm run dev -- -p 3001` |

---

## License

MIT — free to use and modify.
