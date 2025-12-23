import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

const questionUpdateSchema = z.object({
  type: z.enum(["MCQ", "ESSAY"]).optional(),
  questionText: z.string().min(1, "Question text is required").optional(),
  options: z.array(z.string().min(1)).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  sampleAnswer: z.string().optional(),
  difficulty: difficultyEnum.optional(),
  lessonId: z.string().uuid().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const data = questionUpdateSchema.parse(payload);

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        type: data.type,
        questionText: data.questionText,
        options: data.options
          ? data.options.map((text, index) => ({ id: index, text }))
          : undefined,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        sampleAnswer: data.sampleAnswer,
        difficulty: data.difficulty,
        lessonId: data.lessonId,
      },
    });

    return NextResponse.json({
      question: JSON.parse(JSON.stringify(updatedQuestion)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to update question", error);
    return NextResponse.json(
      { error: "Unable to update question. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete question", error);
    return NextResponse.json(
      { error: "Unable to delete question. Please try again later." },
      { status: 500 }
    );
  }
}
