import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { lessonSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role ?? null;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (role === "STUDENT") {
      // Students only see lessons for courses they are enrolled in
      where.course = {
        enrollments: {
          some: {
            studentId: session.user.id,
          },
        },
      };
    } else if (role === "TEACHER") {
      // Teachers only see lessons for courses they teach
      where.course = {
        teacherId: session.user.id,
      };
    } else if (role !== "ADMIN" && role !== "MANAGER") {
      // Other roles (e.g., ATTENDANCE) might not have access, or default to restrictive
      // For now, let's treat them as unauthorized or highly restricted
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(convertToPlainObject(lessons));
  } catch (error) {
    console.error("Failed to load lessons", error);
    return NextResponse.json(
      { error: "Unable to load lessons. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const data = lessonSchema.parse(payload);

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { teacherId: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Selected course could not be found." },
        { status: 404 }
      );
    }

    const role = session.user.role ?? null;

    if (role !== "ADMIN" && course.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to add lessons to this course." },
        { status: 403 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        courseId: data.courseId,
      },
    });

    return NextResponse.json(convertToPlainObject(lesson), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create lesson", error);
    return NextResponse.json(
      { error: "Unable to create lesson. Please try again later." },
      { status: 500 }
    );
  }
}
