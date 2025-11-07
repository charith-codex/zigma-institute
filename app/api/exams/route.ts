import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";

const examQuestionSchema = z.object({
  questionId: z.string().uuid(),
  order: z.number().int().nonnegative(),
  marks: z.number().int().min(1),
});

const createExamSchema = z.object({
  title: z.string().min(1, "Exam title is required"),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  createdById: z.string().uuid().optional(),
  publish: z.boolean().optional(),
  questions: z.array(examQuestionSchema).min(1, "Add at least one question"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const lessonTitle = searchParams.get("lessonTitle");

    const exams = await prisma.examPaper.findMany({
      where: {
        status:
          status === "DRAFT" || status === "PUBLISHED" || status === "CLOSED"
            ? status
            : undefined,
        questions: lessonTitle
          ? {
              some: {
                question: {
                  lessonTitle: {
                    contains: lessonTitle,
                    mode: "insensitive",
                  },
                },
              },
            }
          : undefined,
      },
      include: {
        lesson: { select: { title: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedExams = exams.map((exam) => {
      const lessonTitleFromLesson = exam.lesson?.title ?? null;
      const lessonTitleFromQuestion =
        exam.questions[0]?.question.lessonTitle ?? null;

      const { lesson, ...rest } = exam;

      return {
        ...rest,
        lessonTitle: lessonTitleFromLesson ?? lessonTitleFromQuestion,
      };
    });

    return NextResponse.json({
      exams: JSON.parse(JSON.stringify(sanitizedExams)),
    });
  } catch (error) {
    console.error("Failed to fetch exams", error);
    return NextResponse.json(
      { error: "Unable to fetch exams. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = createExamSchema.parse(payload);

    const exam = await prisma.examPaper.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.publish ? "PUBLISHED" : "DRAFT",
        publishedAt: data.publish ? new Date() : null,
        createdById: data.createdById ?? null,
        questions: {
          create: data.questions.map((question) => ({
            questionId: question.questionId,
            order: question.order,
            marks: question.marks,
          })),
        },
      },
      include: {
        lesson: { select: { title: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: true,
          },
        },
      },
    });

    const lessonTitleFromLesson = exam.lesson?.title ?? null;
    const lessonTitleFromQuestion =
      exam.questions[0]?.question.lessonTitle ?? null;

    const { lesson, ...rest } = exam;

    const sanitizedExam = {
      ...rest,
      lessonTitle:
        lessonTitleFromLesson ?? data.lessonTitle ?? lessonTitleFromQuestion,
    };

    return NextResponse.json(
      { exam: JSON.parse(JSON.stringify(sanitizedExam)) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create exam", error);
    return NextResponse.json(
      { error: "Unable to create exam. Please try again later." },
      { status: 500 }
    );
  }
}
