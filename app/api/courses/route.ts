import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { courseSchema } from "@/lib/validators";

const DEFAULT_CURRENCY = "usd";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { courseCategory: true },
    });

    return NextResponse.json(convertToPlainObject(courses));
  } catch (error) {
    console.error("Failed to load courses", error);
    return NextResponse.json(
      { error: "Unable to load courses. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = courseSchema.parse(payload);

    const existing = await prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
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

    const {
      price,
      teacherId,
      teacherName: _teacherName,
      courseCategoryId,
      ...courseData
    } = data;

    const category = await prisma.courseCategory.findUnique({
      where: { id: courseCategoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Selected course category could not be found." },
        { status: 404 }
      );
    }

    const course = await prisma.course.create({
      data: {
        ...courseData,
        teacherId,
        teacherName: teacher.user.name ?? _teacherName,
        priceInCents: Math.round(price * 100),
        currency: DEFAULT_CURRENCY,
        courseCategoryId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create course", error);
    return NextResponse.json(
      { error: "Unable to create course. Please try again later." },
      { status: 500 }
    );
  }
}
