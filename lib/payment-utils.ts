import { prisma } from "@/db/prisma";

export interface DuePayment {
  courseId: string;
  courseName: string;
  monthlyFee: number;
  currency: string;
  month: number;
  year: number;
}

/**
 * Checks which enrolled courses for a student are missing payments for the current month.
 */
export async function getDuePayments(studentId: string): Promise<DuePayment[]> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get active enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, isActive: true },
    include: { course: true },
  });

  const duePayments: DuePayment[] = [];

  for (const enrollment of enrollments) {
    if (!enrollment.course) continue;

    // Check if a payment exists for this course for the current month/year
    const payment = await prisma.paymentTransaction.findFirst({
      where: {
        studentId,
        courseId: enrollment.courseId,
        paidMonth: currentMonth,
        paidYear: currentYear,
      },
    });

    if (!payment) {
      duePayments.push({
        courseId: enrollment.courseId,
        courseName: enrollment.course.name,
        monthlyFee: enrollment.course.priceInCents,
        currency: enrollment.course.currency,
        month: currentMonth,
        year: currentYear,
      });
    }
  }

  return duePayments;
}

/**
 * Returns true if we are past the first week of the current month.
 */
export function isPastFirstWeekOfMonth(): boolean {
  const now = new Date();
  return now.getDate() > 7;
}

/**
 * Gets students with due payments for the current month (used for Dashboard notifications).
 * Only returns students who are past the first week of the month.
 */
export async function getStudentsWithOverduePayments() {
  if (!isPastFirstWeekOfMonth()) return [];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Find students with active enrollments who haven't paid for the current month
  const studentsWithEnrollments = await prisma.student.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      enrollments: {
        where: { isActive: true },
        include: { course: true },
      },
    },
  });

  const overdueList = [];

  for (const student of studentsWithEnrollments) {
    const overdueCourses = [];
    for (const enrollment of student.enrollments) {
      if (!enrollment.course) continue;

      const payment = await prisma.paymentTransaction.findFirst({
        where: {
          studentId: student.userId,
          courseId: enrollment.courseId,
          paidMonth: currentMonth,
          paidYear: currentYear,
        },
      });

      if (!payment) {
        overdueCourses.push({
          courseId: enrollment.courseId,
          courseName: enrollment.course.name,
          amount: enrollment.course.priceInCents,
        });
      }
    }

    if (overdueCourses.length > 0) {
      overdueList.push({
        studentId: student.userId,
        studentName: student.user.name,
        studentEmail: student.user.email,
        studentPublicId: student.studentPublicId,
        overdueCourses,
      });
    }
  }

  return overdueList;
}
