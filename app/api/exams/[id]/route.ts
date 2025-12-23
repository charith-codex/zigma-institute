import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { updateExamSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const exam = await prisma.examPaper.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
        course: {
          select: {
            name: true,
            teacherName: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ exam: JSON.parse(JSON.stringify(exam)) });
  } catch (error) {
    console.error("Failed to fetch exam", error);
    return NextResponse.json(
      { error: "Unable to fetch exam. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await request.json();
    const data = updateExamSchema.parse(payload);

    const { id } = await context.params;

    const exam = await prisma.examPaper.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const nextStatus =
      data.publish === true
        ? "PUBLISHED"
        : data.publish === false
          ? "DRAFT"
          : (data.status ?? exam.status);

    const updated = await prisma.examPaper.update({
      where: { id },
      data: {
        title: data.title ?? exam.title,
        instructions: data.instructions ?? exam.instructions,
        timeLimitMinutes:
          data.timeLimitMinutes === undefined
            ? exam.timeLimitMinutes
            : data.timeLimitMinutes,
        status: nextStatus as any,
        publishedAt:
          nextStatus === "PUBLISHED"
            ? exam.status === "PUBLISHED"
              ? exam.publishedAt
              : new Date()
            : nextStatus === "DRAFT"
              ? null
              : exam.publishedAt,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
      },
    });

    return NextResponse.json({ exam: JSON.parse(JSON.stringify(updated)) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to update exam", error);
    return NextResponse.json(
      { error: "Unable to update exam. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if exam exists
    const exam = await prisma.examPaper.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Delete questions first (though prisma might handle this if cascade is set,
    // but explicit is safer or required if not set)
    await prisma.examQuestion.deleteMany({
      where: { examId: id },
    });

    await prisma.examPaper.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete exam", error);
    return NextResponse.json(
      { error: "Unable to delete exam. Please try again later." },
      { status: 500 }
    );
  }
}
