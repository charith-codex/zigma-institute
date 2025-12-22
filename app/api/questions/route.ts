import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

const questionInputSchema = z
  .object({
    type: z.enum(["MCQ", "ESSAY"]),
    questionText: z.string().min(1, "Question text is required"),
    options: z.array(z.string().min(1)).optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    sampleAnswer: z.string().optional(),
    difficulty: difficultyEnum.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "MCQ") {
      if (!value.options || value.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple-choice questions require at least two options",
          path: ["options"],
        });
      }

      if (!value.correctAnswer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple-choice questions require a correct answer",
          path: ["correctAnswer"],
        });
      } else if (
        value.options &&
        !value.options.some(
          (option) =>
            option.trim().toLowerCase() ===
            value.correctAnswer?.trim().toLowerCase()
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correct answer must match one of the provided options",
          path: ["correctAnswer"],
        });
      }
    }

    if (value.type === "ESSAY" && !value.sampleAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Essay questions should include a sample answer for teachers",
        path: ["sampleAnswer"],
      });
    }
  });

const createQuestionsSchema = z.object({
  lessonId: z.string().uuid("Lesson ID is required"),
  createdById: z.string().uuid("Creator ID is required"),
  difficulty: difficultyEnum.optional(),
  questions: z
    .array(questionInputSchema)
    .min(1, "At least one question is required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const type = searchParams.get("type");

    const questions = await prisma.question.findMany({
      where: {
        lessonId: lessonId || undefined,
        type:
          type === "MCQ" || type === "ESSAY"
            ? (type as "MCQ" | "ESSAY")
            : undefined,
      },
      include: {
        lesson: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      questions: JSON.parse(JSON.stringify(questions)),
    });
  } catch (error) {
    console.error("Failed to fetch questions", error);
    return NextResponse.json(
      { error: "Unable to fetch questions. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = createQuestionsSchema.parse(payload);

    const createdQuestions = await prisma.$transaction(
      data.questions.map((question) =>
        prisma.question.create({
          data: {
            lessonId: data.lessonId,
            createdById: data.createdById,
            type: question.type,
            questionText: question.questionText,
            options:
              question.type === "MCQ"
                ? (question.options?.map((text, index) => ({
                    id: index,
                    text,
                  })) ?? [])
                : undefined,
            correctAnswer:
              question.type === "MCQ" ? (question.correctAnswer ?? null) : null,
            explanation: question.explanation ?? null,
            sampleAnswer:
              question.type === "ESSAY"
                ? (question.sampleAnswer ?? null)
                : null,
            difficulty: question.difficulty ?? data.difficulty ?? null,
          },
        })
      )
    );

    return NextResponse.json(
      { questions: JSON.parse(JSON.stringify(createdQuestions)) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create questions", error);
    return NextResponse.json(
      { error: "Unable to create questions. Please try again later." },
      { status: 500 }
    );
  }
}
