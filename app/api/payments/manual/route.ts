import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface ManualPaymentRequest {
  studentId: string;
  courseId: string;
  amountInCents: number;
  monthYear: string; // Format: YYYY-MM
  notes?: string;
}

interface ManualPaymentResponse {
  id: string;
  studentId: string;
  courseId: string;
  amountInCents: number;
  monthYear: string;
  transactionId: string;
  paidAt: string;
}

const generateTransactionId = () => `manual_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStaff =
    session.user.role === "ADMIN" ||
    session.user.role === "MANAGER";

  if (!isStaff) {
    return NextResponse.json(
      { error: "Only staff members can record manual payments." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { studentId, courseId, amountInCents, monthYear, notes } = body as ManualPaymentRequest;

  if (!studentId || typeof studentId !== "string" || studentId.trim().length === 0) {
    return NextResponse.json(
      { error: "studentId is required." },
      { status: 400 }
    );
  }

  if (!courseId || typeof courseId !== "string" || courseId.trim().length === 0) {
    return NextResponse.json(
      { error: "courseId is required." },
      { status: 400 }
    );
  }

  if (!amountInCents || typeof amountInCents !== "number" || amountInCents <= 0) {
    return NextResponse.json(
      { error: "amountInCents must be a positive number." },
      { status: 400 }
    );
  }

  if (!monthYear || typeof monthYear !== "string" || !/^\d{4}-\d{2}$/.test(monthYear)) {
    return NextResponse.json(
      { error: "monthYear is required in YYYY-MM format." },
      { status: 400 }
    );
  }

  // Verify student exists and is a student
  const student = await prisma.user.findUnique({
    where: { id: studentId.trim() },
    select: { id: true, role: true, name: true },
  });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Student not found." },
      { status: 404 }
    );
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId.trim() },
    select: { id: true, name: true, currency: true },
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found." },
      { status: 404 }
    );
  }

  // Check if payment already exists for this student, course, and month
  const existingPayment = await prisma.paymentTransaction.findFirst({
    where: {
      studentId: studentId.trim(),
      courseId: courseId.trim(),
      monthYear: monthYear.trim(),
    },
  });

  if (existingPayment) {
    return NextResponse.json(
      { error: `Payment already recorded for ${monthYear} for this course.` },
      { status: 409 }
    );
  }

  // Calculate month number based on existing payments for this course
  const previousPayments = await prisma.paymentTransaction.count({
    where: {
      studentId: studentId.trim(),
      courseId: courseId.trim(),
      paymentType: "INSTALLMENT",
    },
  });

  const monthNumber = previousPayments + 1;
  const transactionId = generateTransactionId();

  // Calculate due date as end of the month
  const [year, month] = monthYear.split("-").map(Number);
  const dueDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

  try {
    const payment = await prisma.paymentTransaction.create({
      data: {
        studentId: studentId.trim(),
        courseId: courseId.trim(),
        amountInCents,
        currency: course.currency,
        paymentType: "INSTALLMENT",
        paymentMethod: "MANUAL",
        monthNumber,
        monthYear: monthYear.trim(),
        dueDate,
        transactionId,
        notes: notes?.trim() || null,
        recordedById: session.user.id,
        paidAt: new Date(),
      },
    });

    const response: ManualPaymentResponse = {
      id: payment.id,
      studentId: payment.studentId,
      courseId: payment.courseId!,
      amountInCents: payment.amountInCents,
      monthYear: payment.monthYear!,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt.toISOString(),
    };

    return NextResponse.json(convertToPlainObject(response), { status: 201 });
  } catch (error) {
    console.error("Failed to record manual payment", error);
    return NextResponse.json(
      { error: "Failed to record payment." },
      { status: 500 }
    );
  }
}
