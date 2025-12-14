import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { tuteSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  try {
    const tutes = await prisma.tute.findMany({
      where: courseId ? { courseId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { distributions: { where: { distributed: true } } },
        },
      },
    });

    const formatted = tutes.map((tute) => ({
      ...tute,
      distributedCount: tute._count?.distributions ?? 0,
    }));

    return NextResponse.json(convertToPlainObject(formatted));
  } catch (error) {
    console.error("Failed to load tutes", error);
    return NextResponse.json(
      { error: "Unable to load tutes. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = tuteSchema.parse(payload);

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Selected course could not be found." },
        { status: 404 }
      );
    }

    const duplicate = await prisma.tute.findFirst({
      where: { courseId: data.courseId, name: data.name.trim() },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A tute with this name already exists for the course." },
        { status: 409 }
      );
    }

    const tute = await prisma.tute.create({
      data: {
        name: data.name.trim(),
        courseId: data.courseId,
      },
    });

    return NextResponse.json({ ...tute, distributedCount: 0 }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create tute", error);
    return NextResponse.json(
      { error: "Unable to create tute. Please try again later." },
      { status: 500 }
    );
  }
}
