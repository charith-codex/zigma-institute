import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface PaymentHistoryResponse {
  id: string;
  courseId: string | null;
  courseName: string | null;
  paidOn: string;
  amountPaidInCents: number;
  currency: string;
  paymentType: "INSTALLMENT" | "REGISTRATION";
  monthNumber: number | null;
  transactionId: string;
  discountRate: number | null;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Only students can view their payments." },
      { status: 403 }
    );
  }

  const transactions = await prisma.paymentTransaction.findMany({
    where: { studentId: session.user.id },
    include: { course: { select: { id: true, name: true } } },
    orderBy: { paidAt: "desc" },
  });

  const payload: PaymentHistoryResponse[] = transactions.map((payment) => ({
    id: payment.id,
    courseId: payment.course?.id ?? null,
    courseName: payment.course?.name ?? null,
    paidOn: payment.paidAt.toISOString(),
    amountPaidInCents: payment.amountInCents,
    currency: payment.currency,
    paymentType: payment.paymentType,
    monthNumber: payment.monthNumber ?? null,
    transactionId: payment.transactionId,
    discountRate: payment.discountRate ?? null,
  }));

  return NextResponse.json(convertToPlainObject(payload));
}
