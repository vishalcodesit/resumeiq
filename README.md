# ResumeIQ — AI Resume Feedback & ATS Scanner

A full-stack Next.js 14 application that analyzes PDF resumes using OpenAI GPT-4o-mini. Get an ATS compatibility score, keyword gap analysis, and actionable improvement suggestions in seconds.

---

## Features

- **ATS Score (0–100)** — Instant compatibility rating with animated score ring
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
| PDF Parsing | pdf-parse |
| AI Analysis | OpenAI GPT-4o-mini |
| Animations | CSS keyframes |
| File Upload | react-dropzone |
| Icons | lucide-react |
| Language | TypeScript |

---

## Project Structure

```
resume-ats-scanner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts        # POST /api/analyze — PDF parsing + OpenAI
│   │   ├── globals.css             # Tailwind + custom fonts + CSS variables
│   │   ├── layout.tsx              # Root layout with metadata
│   │   └── page.tsx                # Main page (upload → loading → results)
│   ├── components/
│   │   ├── DropZone.tsx            # Drag & drop PDF uploader
│   │   ├── LoadingSpinner.tsx      # Animated multi-step loader
│   │   ├── ResultsPanel.tsx        # Full results dashboard
│   │   ├── ScoreRing.tsx           # Animated SVG score ring
│   │   └── SectionScores.tsx      # Animated progress bars
│   └── lib/
│       ├── openai.ts               # OpenAI client + system prompt
│       └── types.ts                # TypeScript interfaces
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Setup

### Prerequisites

- **Node.js** v18.17 or later
- **npm** v9+ (or yarn / pnpm)
- An **OpenAI API key** — get one at https://platform.openai.com/api-keys

---

### Step 1 — Clone / Download

```bash
# If using git
git clone <your-repo-url>
cd resume-ats-scanner

# Or just navigate to the extracted folder
cd resume-ats-scanner
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

Open `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
2. Click **"Analyze My Resume"**
3. Wait ~10–20 seconds for the AI to process
4. Review your **ATS score**, **feedback**, **missing keywords**, and **improvements**
5. Click **"New scan"** to analyze another resume

---

## API Route

### `POST /api/analyze`

Accepts a `multipart/form-data` request with a `resume` field containing a PDF file.

**Request:**
```
Content-Type: multipart/form-data
Body: resume=<PDF file>
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
    ]
  }
}
```

**Error Response:**
```json
{ "error": "Only PDF files are supported" }
```

---

## Customization

### Swap OpenAI model
In `src/lib/openai.ts`, change the model:
```ts
model: "gpt-4o",          // More accurate, slower, costs more
model: "gpt-4o-mini",     // Default — fast and cheap
model: "gpt-3.5-turbo",   // Fastest, least accurate
```

### Adjust scoring weights
Edit the `SYSTEM_PROMPT` in `src/lib/openai.ts` to change how sections are weighted or what keywords the AI prioritizes.

### Add job description matching
Extend the API route to accept a second `jobDescription` field and include it in the OpenAI prompt for targeted keyword matching.

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable in Vercel dashboard:
# OPENAI_API_KEY = sk-proj-...
```

Or connect your GitHub repo to Vercel and set `OPENAI_API_KEY` in **Project Settings → Environment Variables**.

> Set the function max duration to 60s in Vercel for large resumes: add `export const maxDuration = 60` in the route (already included).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `OPENAI_API_KEY not configured` | Check your `.env.local` file exists and has the key |
| `Could not extract text from PDF` | Resume is a scanned image — use a text-based PDF |
| `Analysis failed` | Check your OpenAI account has credits |
| `npm install` fails | Ensure Node.js v18.17+ is installed (`node --version`) |
| Port 3000 in use | Run `npm run dev -- -p 3001` |

---

## License

MIT — free to use and modify.
