import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { createExamSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");

    const exams = await prisma.examPaper.findMany({
      where: {
        status:
          status === "DRAFT" || status === "PUBLISHED" || status === "CLOSED"
            ? status
            : undefined,
        courseId: courseId ?? undefined,
      },
      include: {
        course: { select: { name: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      exams: JSON.parse(JSON.stringify(exams)),
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
        instructions: data.instructions ?? null,
        timeLimitMinutes: data.timeLimitMinutes ?? null,
        courseId: data.courseId,
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
        course: { select: { name: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: true,
          },
        },
      },
    });

    return NextResponse.json(
      { exam: JSON.parse(JSON.stringify(exam)) },
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
