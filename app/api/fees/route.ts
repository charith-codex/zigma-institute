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
  transactionId: string | null;
  paidMonth: number | null;
  paidYear: number | null;
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

const formatMonth = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;
const formatMonthFromDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

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

  const transactions = await prisma.paymentTransaction.findMany({
    include: {
      student: { select: { name: true, email: true } },
      course: { select: { name: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  const records: FeeRecord[] = transactions.map((payment) => ({
    id: payment.id,
    studentId: payment.studentId,
    studentName: payment.student?.name ?? "Unknown student",
    studentEmail: payment.student?.email ?? null,
    courseId: payment.courseId ?? null,
    courseName: payment.course?.name ?? "Registration",
    amountInCents: payment.amountInCents,
    currency: payment.currency,
    paidAt: payment.paidAt.toISOString(),
    transactionId: payment.transactionId,
    paidMonth: payment.paidMonth,
    paidYear: payment.paidYear,
  }));

  const monthlyIncomeMap = new Map<string, number>();
  const courseTotalsMap = new Map<
    string,
    { name: string; total: number; count: number }
  >();
  const studentTotalsMap = new Map<
    string,
    { name: string; email: string | null; total: number; count: number }
  >();

  records.forEach((record) => {
    const monthKey =
      record.paidMonth && record.paidYear
        ? formatMonth(record.paidYear, record.paidMonth)
        : formatMonthFromDate(new Date(record.paidAt));

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
    }

    const studentKey =
      record.studentId ?? record.studentEmail ?? record.studentName;
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
    totalIncomeInCents: records.reduce(
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

  return NextResponse.json(
    convertToPlainObject({
      records,
      summary,
    })
  );
}
