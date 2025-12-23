import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const generateSchema = z.object({
  lessonId: z.string("Lesson ID is required"),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  mcqCount: z.coerce.number().int().min(0).max(10),
  essayCount: z.coerce.number().int().min(0).max(10),
  createdById: z.string().optional(),
  materialId: z.string("Study material ID is required"),
  customPrompt: z.string().max(50).optional(),
});

const JSON_FENCE = /```json([\s\S]*?)```/i;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const materialId = formData.get("materialId") as string;

    if (!materialId) {
      return NextResponse.json(
        { error: "Study material selection is required" },
        { status: 400 }
      );
    }

    const parsed = generateSchema.parse({
      lessonId: formData.get("lessonId"),
      lessonTitle: formData.get("lessonTitle"),
      difficulty: formData.get("difficulty") ?? undefined,
      mcqCount: formData.get("mcqCount"),
      essayCount: formData.get("essayCount"),
      createdById: formData.get("createdById") ?? undefined,
      materialId: formData.get("materialId"),
      customPrompt: formData.get("customPrompt") ?? undefined,
    });

    if (parsed.mcqCount === 0 && parsed.essayCount === 0) {
      return NextResponse.json(
        { error: "Select at least one question to generate" },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/db/prisma");
    const material = await prisma.studyMaterial.findUnique({
      where: { id: parsed.materialId },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Study material not found" },
        { status: 404 }
      );
    }

    // Fetch PDF content from URL
    const pdfResponse = await fetch(material.fileUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "Failed to download study material PDF" },
        { status: 500 }
      );
    }

    const fileBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    const base64Pdf = fileBuffer.toString("base64");

    const systemPrompt = `You are an expert assessment designer. Read the provided lesson carefully and craft challenging questions. Always answer with valid JSON only.`;

    const userPrompt = `Lesson Title: ${parsed.lessonTitle}
Difficulty: ${parsed.difficulty}
Multiple Choice Questions Requested: ${parsed.mcqCount}
Essay Questions Requested: ${parsed.essayCount}
${parsed.customPrompt ? `Custom Instructions: ${parsed.customPrompt}` : ""}

The lesson content is provided below as a base64-encoded PDF file. Decode it to understand the lesson before creating questions.

---BEGIN BASE64 PDF---
${base64Pdf}
---END BASE64 PDF---

Return a JSON object with the following structure:
{
  "mcq": [
    {
      "questionText": string,
      "options": [string, ...],
      "correctAnswer": string,
      "explanation": string,
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ],
  "essay": [
    {
      "questionText": string,
      "sampleAnswer": string,
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}

Ensure the number of MCQ and essay questions matches the counts requested. Explanations should justify the correct MCQ answers clearly.`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `${systemPrompt}\n\n${userPrompt}`,
    });

    const match = text.match(JSON_FENCE);
    const rawJson = match ? match[1] : text;

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawJson);
    } catch (error) {
      console.error("Failed to parse AI response", error, text);
      return NextResponse.json(
        { error: "The AI response could not be parsed. Please try again." },
        { status: 422 }
      );
    }

    const resultSchema = z.object({
      mcq: z
        .array(
          z.object({
            questionText: z.string(),
            options: z.array(z.string().min(1)).min(2),
            correctAnswer: z.string(),
            explanation: z.string().optional().default(""),
            difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
          })
        )
        .max(parsed.mcqCount),
      essay: z
        .array(
          z.object({
            questionText: z.string(),
            sampleAnswer: z.string().min(1),
            difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
          })
        )
        .max(parsed.essayCount),
    });

    const structured = resultSchema.parse(parsedJson);

    return NextResponse.json({
      lessonId: parsed.lessonId,
      lessonTitle: parsed.lessonTitle,
      difficulty: parsed.difficulty,
      sourceFileName: material.title,
      createdById: parsed.createdById,
      questions: [
        ...structured.mcq.map((question) => ({
          type: "MCQ" as const,
          questionText: question.questionText.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: question.correctAnswer.trim(),
          explanation: question.explanation?.trim() ?? "",
          difficulty: question.difficulty ?? parsed.difficulty,
        })),
        ...structured.essay.map((question) => ({
          type: "ESSAY" as const,
          questionText: question.questionText.trim(),
          sampleAnswer: question.sampleAnswer.trim(),
          difficulty: question.difficulty ?? parsed.difficulty,
        })),
      ],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to generate questions", error);
    return NextResponse.json(
      { error: "Unable to generate questions. Please try again later." },
      { status: 500 }
    );
  }
}
