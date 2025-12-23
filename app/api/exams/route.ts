import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { createExamSchema } from "@/lib/validators";

import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "MANAGER";
    const isStudent = session.user.role === "STUDENT";

    const where: any = {
      status:
        status === "DRAFT" || status === "PUBLISHED" || status === "CLOSED"
          ? status
          : undefined,
      courseId: courseId ?? undefined,
    };

    if (isStudent) {
      where.course = {
        enrollments: {
          some: {
            studentId: session.user.id,
            isActive: true,
          },
        },
      };
    }

    const exams = await prisma.examPaper.findMany({
      where,
      include: {
        course: { select: { name: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: true,
          },
        },
        _count: {
          select: { attempts: true },
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
