import { NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface Params {
  courseId: string;
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const courseId = params.courseId?.trim();

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: { include: { user: true } } },
      orderBy: { enrolledAt: "asc" },
    });

    const students = enrollments
      .map((enrollment) => enrollment.student)
      .filter((student): student is NonNullable<typeof student> => Boolean(student))
      .map((student) => ({
        id: student.userId,
        name: student.user?.name ?? "Student",
        studentPublicId: student.studentPublicId ?? null,
        email: student.user?.email ?? null,
      }));

    return NextResponse.json(convertToPlainObject(students));
  } catch (error) {
    console.error("Failed to load students for course", error);
    return NextResponse.json(
      { error: "Unable to load course students. Please try again later." },
      { status: 500 }
    );
  }
}
