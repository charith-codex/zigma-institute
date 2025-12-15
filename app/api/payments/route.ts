import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface PaymentCoursePayload {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  teacherName: string;
  priceInCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  enrolledAt: Date;
}

interface PaymentStudentPayload {
  id: string;
  name: string | null;
  email: string | null;
}

interface PaymentResponse {
  student: PaymentStudentPayload;
  courses: PaymentCoursePayload[];
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Only students can view payment information." },
      { status: 403 }
    );
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      student: true,
    },
  });

  if (!student || (!student.student && !isAdmin)) {
    return NextResponse.json(
      { error: "Student profile not found for this account." },
      { status: 404 }
    );
  }

  const enrollments = isAdmin
    ? []
    : await prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        include: { course: true },
        orderBy: { enrolledAt: "desc" },
      });

  const courses: PaymentCoursePayload[] = enrollments.flatMap((enrollment) => {
    const course = enrollment.course;

    if (!course) {
      return [];
    }

    return [
      {
        id: course.id,
        name: course.name,
        description: course.description,
        coverImage: course.coverImage,
        teacherName: course.teacherName,
        priceInCents: course.priceInCents,
        currency: course.currency,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        enrolledAt: enrollment.enrolledAt,
      },
    ];
  });

  const payload: PaymentResponse = {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
    courses,
  };

  return NextResponse.json(convertToPlainObject(payload));
}
