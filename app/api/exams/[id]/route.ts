import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  publish: z.boolean().optional(),
});

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
    const data = updateSchema.parse(payload);

    const { id } = await context.params;

    const exam = await prisma.examPaper.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const nextStatus = data.publish
      ? "PUBLISHED"
      : (data.status ?? exam.status);

    const updated = await prisma.examPaper.update({
      where: { id },
      data: {
        title: data.title ?? exam.title,
        description: data.description ?? exam.description,
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" ? new Date() : exam.publishedAt,
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
