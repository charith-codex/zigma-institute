import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { courseSchema } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { courseId } = await params;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required." },
      { status: 400 }
    );
  }

  try {
    const payload = await request.json();
    const data = courseSchema.parse(payload);

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    const conflictingSlug = await prisma.course.findFirst({
      where: {
        slug: data.slug,
        NOT: { id: courseId },
      },
    });

    if (conflictingSlug) {
      return NextResponse.json(
        { error: "A course with this slug already exists." },
        { status: 409 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: data.teacherId },
      include: {
        user: true,
      },
    });

    if (!teacher || !teacher.user) {
      return NextResponse.json(
        { error: "Selected teacher could not be found." },
        { status: 404 }
      );
    }

    const { price, teacherId, teacherName: _teacherName, ...courseData } = data;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...courseData,
        teacherId,
        teacherName: teacher.user.name ?? _teacherName,
        priceInCents: Math.round(price * 100),
      },
    });

    return NextResponse.json(convertToPlainObject(updatedCourse));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    console.error("Failed to update course", error);
    return NextResponse.json(
      { error: "Unable to update course. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const { courseId } = await params;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required." },
      { status: 400 }
    );
  }

  try {
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json(convertToPlainObject(deletedCourse));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    console.error("Failed to delete course", error);
    return NextResponse.json(
      { error: "Unable to delete course. Please try again later." },
      { status: 500 }
    );
  }
}
