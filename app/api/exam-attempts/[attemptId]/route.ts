import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";

const gradeSchema = z.object({
  gradedById: z.string().uuid().optional(),
  essayMarks: z
    .array(
      z.object({
        answerId: z.string().uuid(),
        marksAwarded: z.number().int().min(0),
        feedback: z.string().optional(),
      })
    )
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const payload = await request.json();
    const data = gradeSchema.parse(payload);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const updates = data.essayMarks?.map((essay) =>
      prisma.examAnswer.update({
        where: { id: essay.answerId },
        data: {
          marksAwarded: essay.marksAwarded,
          feedback: essay.feedback ?? null,
        },
      })
    );

    if (updates && updates.length > 0) {
      await prisma.$transaction(updates);
    }

    const refreshedAnswers = await prisma.examAnswer.findMany({
      where: { attemptId: attempt.id },
    });

    const totalScore = refreshedAnswers.reduce(
      (sum, answer) => sum + (answer.marksAwarded ?? 0),
      0
    );

    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        status: "GRADED",
        gradedAt: new Date(),
        gradedById: data.gradedById ?? null,
      },
      include: {
        exam: {
          select: { id: true, title: true, lessonTitle: true, status: true },
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: { question: true },
        },
      },
    });

    return NextResponse.json({
      attempt: JSON.parse(JSON.stringify(updatedAttempt)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to grade exam", error);
    return NextResponse.json(
      { error: "Unable to grade this exam attempt. Please try again later." },
      { status: 500 }
    );
  }
}
