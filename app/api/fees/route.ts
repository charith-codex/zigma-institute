import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface FeeRecord {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string | null;
  courseId: string | null;
  courseName: string | null;
  amountInCents: number;
  currency: string;
  paidAt: string;
  paymentType: "INSTALLMENT" | "REGISTRATION";
  transactionId: string | null;
  monthNumber: number | null;
  discountRate: number | null;
}

interface FeeSummary {
  totalIncomeInCents: number;
  monthlyIncome: { month: string; totalInCents: number }[];
  courseTotals: {
    courseId: string;
    courseName: string;
    totalInCents: number;
    payments: number;
  }[];
  studentTotals: {
    studentId: string | null;
    studentName: string;
    studentEmail: string | null;
    totalInCents: number;
    payments: number;
  }[];
}

interface FeeResponse {
  records: FeeRecord[];
  summary: FeeSummary;
}

const formatMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Only staff can access fee management." },
      { status: 403 }
    );
  }

  const [transactions, registrations] = await Promise.all([
    prisma.paymentTransaction.findMany({
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { name: true } },
      },
      orderBy: { paidAt: "desc" },
    }),
    prisma.studentRegistration.findMany({
      where: { status: "PAID" },
      include: {
        courses: { include: { course: true } },
        student: { include: { user: true } },
      },
    }),
  ]);

  const transactionRecords: FeeRecord[] = transactions.map((payment) => ({
    id: payment.id,
    studentId: payment.studentId,
    studentName: payment.student?.name ?? "Unknown student",
    studentEmail: payment.student?.email ?? null,
    courseId: payment.courseId ?? null,
    courseName: payment.course?.name ?? null,
    amountInCents: payment.amountInCents,
    currency: payment.currency,
    paidAt: payment.paidAt.toISOString(),
    paymentType: payment.paymentType,
    transactionId: payment.transactionId,
    monthNumber: payment.monthNumber ?? null,
    discountRate: payment.discountRate ?? null,
  }));

  const registrationCourseShares = new Map<
    string,
    { courseId: string; courseName: string; amountInCents: number }[]
  >();

  const registrationRecords: FeeRecord[] = registrations.map((registration) => {
    const courseSelections = registration.courses.filter(
      (item): item is typeof item & { course: NonNullable<typeof item.course> } =>
        Boolean(item.course)
    );

    const courseNames = courseSelections.map((item) => item.course.name).join(", ");
    const courseCount = Math.max(1, courseSelections.length);
    const baseShare = Math.floor(registration.totalAmountInCents / courseCount);
    const remainder = registration.totalAmountInCents - baseShare * courseCount;

    const shares = courseSelections.map((item, index) => ({
      courseId: item.course.id,
      courseName: item.course.name,
      amountInCents: index === 0 ? baseShare + remainder : baseShare,
    }));

    registrationCourseShares.set(registration.id, shares);

    return {
      id: registration.id,
      studentId: registration.studentUserId ?? null,
      studentName: registration.student?.user.name ?? registration.name,
      studentEmail: registration.student?.user.email ?? registration.email,
      courseId: null,
      courseName: courseNames || "Registration",
      amountInCents: registration.totalAmountInCents,
      currency: registration.currency,
      paidAt: registration.updatedAt.toISOString(),
      paymentType: "REGISTRATION",
      transactionId: registration.stripeSessionId ?? registration.id,
      monthNumber: 1,
      discountRate: null,
    } satisfies FeeRecord;
  });

  const allRecords = [...transactionRecords, ...registrationRecords];

  const monthlyIncomeMap = new Map<string, number>();
  const courseTotalsMap = new Map<string, { name: string; total: number; count: number }>();
  const studentTotalsMap = new Map<string, { name: string; email: string | null; total: number; count: number }>();

  allRecords.forEach((record) => {
    const paidDate = new Date(record.paidAt);
    const monthKey = formatMonth(paidDate);
    monthlyIncomeMap.set(
      monthKey,
      (monthlyIncomeMap.get(monthKey) ?? 0) + record.amountInCents
    );

    if (record.courseId && record.courseName) {
      const courseKey = record.courseId;
      const existing = courseTotalsMap.get(courseKey) ?? {
        name: record.courseName,
        total: 0,
        count: 0,
      };
      courseTotalsMap.set(courseKey, {
        name: existing.name,
        total: existing.total + record.amountInCents,
        count: existing.count + 1,
      });
    } else if (record.paymentType === "REGISTRATION") {
      const shares = registrationCourseShares.get(record.id) ?? [];
      shares.forEach((share) => {
        const existing = courseTotalsMap.get(share.courseId) ?? {
          name: share.courseName,
          total: 0,
          count: 0,
        };

        courseTotalsMap.set(share.courseId, {
          name: existing.name,
          total: existing.total + share.amountInCents,
          count: existing.count + 1,
        });
      });
    }

    const studentKey = record.studentId ?? record.studentEmail ?? record.studentName;
    const existingStudent = studentTotalsMap.get(studentKey) ?? {
      name: record.studentName,
      email: record.studentEmail,
      total: 0,
      count: 0,
    };

    studentTotalsMap.set(studentKey, {
      name: existingStudent.name,
      email: existingStudent.email,
      total: existingStudent.total + record.amountInCents,
      count: existingStudent.count + 1,
    });
  });

  const summary: FeeSummary = {
    totalIncomeInCents: allRecords.reduce(
      (sum, record) => sum + record.amountInCents,
      0
    ),
    monthlyIncome: Array.from(monthlyIncomeMap.entries())
      .map(([month, totalInCents]) => ({ month, totalInCents }))
      .sort((a, b) => (a.month < b.month ? 1 : -1)),
    courseTotals: Array.from(courseTotalsMap.entries())
      .map(([courseId, entry]) => ({
        courseId,
        courseName: entry.name,
        totalInCents: entry.total,
        payments: entry.count,
      }))
      .sort((a, b) => b.totalInCents - a.totalInCents),
    studentTotals: Array.from(studentTotalsMap.entries())
      .map(([studentId, entry]) => ({
        studentId,
        studentName: entry.name,
        studentEmail: entry.email,
        totalInCents: entry.total,
        payments: entry.count,
      }))
      .sort((a, b) => b.totalInCents - a.totalInCents),
  };

  const response: FeeResponse = {
    records: allRecords.sort((a, b) =>
      new Date(a.paidAt).getTime() < new Date(b.paidAt).getTime() ? 1 : -1
    ),
    summary,
  };

  return NextResponse.json(convertToPlainObject(response));
}
