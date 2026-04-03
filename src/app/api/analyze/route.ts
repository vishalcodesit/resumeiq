import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resumeText: string;
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      resumeText = pdfData.text;

      if (!resumeText || resumeText.trim().length < 50) {
        return NextResponse.json(
          { error: "Could not extract text from PDF. Please ensure it's not a scanned image." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to parse PDF. Please try a different file." },
        { status: 400 }
      );
    }

    // Analyze with Groq
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const analysis = await analyzeResume(resumeText);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}