"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export interface FeeRecord {
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

export async function listFeeTransactions(params: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}): Promise<{ data: FeeRecord[]; totalCount: number }> {
  const session = await auth();

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    throw new Error("Unauthorized");
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const skip = (page - 1) * pageSize;
  const searchTerm = params.searchTerm?.trim().toLowerCase();

  try {
    const where: any = {};

    if (searchTerm) {
      where.OR = [
        {
          student: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
        },
        {
          course: {
            name: { contains: searchTerm, mode: "insensitive" },
          },
        },
        {
          transactionId: { contains: searchTerm, mode: "insensitive" },
        },
      ];
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          student: { select: { name: true, email: true } },
          course: { select: { name: true } },
        },
        orderBy: { paidAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

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

    return {
      data: records,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to load fee transactions", error);
    throw new Error("Failed to load fee transactions");
  }
}
