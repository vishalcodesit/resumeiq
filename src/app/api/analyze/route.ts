import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured. Add it to .env.local and restart the server." },
        { status: 500 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid upload. Please try again." }, { status: 400 });
    }

    const file = formData.get("resume");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Some browsers/OSes send an empty or generic MIME type for PDFs, so also accept by extension.
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    let resumeText: string;
    try {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      resumeText = (await extractText(pdf, { mergePages: true })).text;
    } catch (error) {
      console.error("PDF parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse PDF. Please try a different file." },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Please ensure it's not a scanned image." },
        { status: 400 }
      );
    }

    const jd = formData.get("jobDescription");
    const jobDescription = typeof jd === "string" ? jd.trim() : "";
    if (jobDescription && jobDescription.length < 50) {
      return NextResponse.json(
        { error: "Job description is too short. Paste the full posting or leave it empty." },
        { status: 400 }
      );
    }

    const analysis = await analyzeResume(resumeText, jobDescription || undefined);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
