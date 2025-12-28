import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { markSchema } from "@/lib/validators";
import { sendAttendanceNotificationEmail } from "@/email";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = markSchema.safeParse(payload);

  if (!data.success) {
    const message = data.error.issues.map((issue) => issue.message).join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { id: data.data.sessionId },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Attendance session not found" },
      { status: 404 }
    );
  }

  if (!session.courseId) {
    return NextResponse.json(
      { error: "This session is not linked to a specific course" },
      { status: 400 }
    );
  }

  const normalizedPublicId = data.data.studentPublicId.trim().toUpperCase();

  // Find student by public ID
  const student = await prisma.student.findUnique({
    where: { studentPublicId: normalizedPublicId },
    include: {
      user: true,
      registration: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.userId,
        courseId: session.courseId,
      },
    },
  });

  if (!enrollment || !enrollment.isActive) {
    return NextResponse.json(
      {
        error:
          "Student is not enrolled in this course or enrollment is inactive",
      },
      { status: 403 }
    );
  }

  // Check payment for the session month/year
  const sessionMonth = session.sessionDate.getUTCMonth() + 1;
  const sessionYear = session.sessionDate.getUTCFullYear();

  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      studentId: student.userId,
      courseId: session.courseId,
      paidMonth: sessionMonth,
      paidYear: sessionYear,
    },
  });

  const paymentWarning = !payment;

  const existing = await prisma.attendanceEntry.findUnique({
    where: {
      sessionId_studentPublicId: {
        sessionId: session.id,
        studentPublicId: normalizedPublicId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      convertToPlainObject({
        alreadyMarked: true,
        entry: existing,
        paymentWarning,
      })
    );
  }

  const entry = await prisma.attendanceEntry.create({
    data: {
      sessionId: session.id,
      studentPublicId: normalizedPublicId,
      studentName: student.user.name,
      registrationId:
        student.registration?.id ?? data.data.registrationId ?? null,
    },
  });

  // Send email to parent
  if (student.parentEmail) {
    try {
      const markedAt = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());

      await sendAttendanceNotificationEmail({
        to: student.parentEmail,
        studentName: student.user.name,
        courseName: session.courseName,
        markedAt,
      });
    } catch (emailError) {
      console.error("Failed to send attendance email notification", emailError);
    }
  }

  return NextResponse.json(
    convertToPlainObject({
      alreadyMarked: false,
      entry,
      paymentWarning,
    })
  );
}
