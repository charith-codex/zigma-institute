import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface DuePayment {
  courseId: string;
  courseName: string;
  monthYear: string;
  dueDate: string;
  amountDueInCents: number;
  currency: string;
  isOverdue: boolean;
  daysOverdue: number;
}

interface DuePaymentsResponse {
  duePayments: DuePayment[];
  totalDueCount: number;
  overdueCount: number;
}

const formatMonthYear = (date: Date) => 
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getEndOfMonth = (year: number, month: number) =>
  new Date(year, month, 0, 23, 59, 59, 999);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStudent = session.user.role === "STUDENT";
  const isStaff = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  if (!isStudent && !isStaff) {
    return NextResponse.json(
      { error: "Access denied." },
      { status: 403 }
    );
  }

  // For students, only get their own due payments
  const studentFilter = isStudent ? { studentId: session.user.id } : undefined;

  // Get all active enrollments (for students or all if staff)
  const enrollments = await prisma.enrollment.findMany({
    where: {
      isActive: true,
      ...(studentFilter ? { studentId: studentFilter.studentId } : {}),
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          priceInCents: true,
          currency: true,
        },
      },
      student: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const now = new Date();
  const currentMonthYear = formatMonthYear(now);

  const duePayments: DuePayment[] = [];

  for (const enrollment of enrollments) {
    if (!enrollment.course) continue;

    const studentId = enrollment.student?.userId;
    if (!studentId) continue;

    // Check if payment exists for current month
    const existingPayment = await prisma.paymentTransaction.findFirst({
      where: {
        studentId,
        courseId: enrollment.course.id,
        monthYear: currentMonthYear,
      },
    });

    if (!existingPayment) {
      // Calculate due date (end of current month)
      const [year, month] = currentMonthYear.split("-").map(Number);
      const dueDate = getEndOfMonth(year, month);
      
      // Check if we're past the first week of the month (after day 7)
      const dayOfMonth = now.getDate();
      const isAfterFirstWeek = dayOfMonth > 7;
      
      // Calculate overdue status (if current date is past end of month)
      const isOverdue = now > dueDate;
      const daysOverdue = isOverdue 
        ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Only add to due list if after first week of month OR overdue
      if (isAfterFirstWeek || isOverdue) {
        duePayments.push({
          courseId: enrollment.course.id,
          courseName: enrollment.course.name,
          monthYear: currentMonthYear,
          dueDate: dueDate.toISOString(),
          amountDueInCents: enrollment.course.priceInCents,
          currency: enrollment.course.currency,
          isOverdue,
          daysOverdue,
        });
      }
    }

    // Also check for any previous months that are unpaid (overdue)
    const enrolledDate = new Date(enrollment.enrolledAt);
    
    // Check all months from enrollment to last month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    for (
      let checkDate = new Date(enrolledDate);
      checkDate <= lastMonth;
      checkDate.setMonth(checkDate.getMonth() + 1)
    ) {
      const checkMonthYear = formatMonthYear(checkDate);
      
      // Skip current month (already handled above)
      if (checkMonthYear === currentMonthYear) {
        continue;
      }

      const monthPayment = await prisma.paymentTransaction.findFirst({
        where: {
          studentId,
          courseId: enrollment.course.id,
          monthYear: checkMonthYear,
        },
      });

      if (!monthPayment) {
        const [year, month] = checkMonthYear.split("-").map(Number);
        const dueDate = getEndOfMonth(year, month);
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        duePayments.push({
          courseId: enrollment.course.id,
          courseName: enrollment.course.name,
          monthYear: checkMonthYear,
          dueDate: dueDate.toISOString(),
          amountDueInCents: enrollment.course.priceInCents,
          currency: enrollment.course.currency,
          isOverdue: true,
          daysOverdue,
        });
      }
    }
  }

  // Sort by overdue status (overdue first) then by month
  duePayments.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) {
      return a.isOverdue ? -1 : 1;
    }
    return a.monthYear.localeCompare(b.monthYear);
  });

  const response: DuePaymentsResponse = {
    duePayments,
    totalDueCount: duePayments.length,
    overdueCount: duePayments.filter(p => p.isOverdue).length,
  };

  return NextResponse.json(convertToPlainObject(response));
}
