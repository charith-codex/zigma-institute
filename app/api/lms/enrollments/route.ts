import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface EnrollmentPayload {
  id: string;
  courseId: string;
  enrolledAt: Date;
  course: {
    id: string;
    name: string;
    slug: string | null;
    description: string;
    coverImage: string;
    teacherName: string | null;
    priceInCents: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const buildUnauthorized = (message: string, status = 401) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return buildUnauthorized("Unauthorized");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && session.user.role !== "STUDENT") {
    return buildUnauthorized("Only students can view enrollments.", 403);
  }

  const enrollments = await prisma.enrollment.findMany({
    where: isAdmin ? undefined : { studentId: session.user.id },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });

  const payload: EnrollmentPayload[] = enrollments.reduce<EnrollmentPayload[]>(
    (accumulator, enrollment) => {
      if (!enrollment.course) {
        return accumulator;
      }

      const course = enrollment.course;

      accumulator.push({
        id: enrollment.id,
        courseId: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt,
        course: {
          id: course.id,
          name: course.name,
          slug: course.slug,
          description: course.description,
          coverImage: course.coverImage,
          teacherName: course.teacherName,
          priceInCents: course.priceInCents,
          currency: course.currency,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
      });

      return accumulator;
    },
    []
  );

  return NextResponse.json(convertToPlainObject(payload));
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return buildUnauthorized("Unauthorized");
  }

  if (session.user.role !== "STUDENT") {
    return buildUnauthorized("Only students can enroll in courses.", 403);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const courseId = (body as { courseId?: unknown }).courseId;

  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  }

  const normalizedCourseId = courseId.trim();

  const course = await prisma.course.findUnique({ where: { id: normalizedCourseId } });

  if (!course) {
    return NextResponse.json(
      { error: "Selected course could not be found." },
      { status: 404 }
    );
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.id, courseId: normalizedCourseId } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You are already enrolled in this course." },
      { status: 409 }
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: { studentId: session.user.id, courseId: normalizedCourseId },
    include: { course: true },
  });

  if (!enrollment.course) {
    return NextResponse.json(
      { error: "Enrollment was created without course data." },
      { status: 500 }
    );
  }

  const payload: EnrollmentPayload = {
    id: enrollment.id,
    courseId: enrollment.courseId,
    enrolledAt: enrollment.enrolledAt,
    course: {
      id: enrollment.course.id,
      name: enrollment.course.name,
      slug: enrollment.course.slug,
      description: enrollment.course.description,
      coverImage: enrollment.course.coverImage,
      teacherName: enrollment.course.teacherName,
      priceInCents: enrollment.course.priceInCents,
      currency: enrollment.course.currency,
      createdAt: enrollment.course.createdAt,
      updatedAt: enrollment.course.updatedAt,
    },
  };

  return NextResponse.json(convertToPlainObject(payload), { status: 201 });
}
