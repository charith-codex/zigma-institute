import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "MANAGER" ||
      session.user.role === "ATTENDANCE";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get enrollment trends for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get student enrollments per month
    const studentEnrollments = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Get teacher registrations per month
    const teacherRegistrations = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month and count
    const monthlyData: { [key: string]: { students: number; teachers: number } } = {};
    
    // Initialize months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = { students: 0, teachers: 0 };
    }

    // Count student enrollments
    studentEnrollments.forEach(enrollment => {
      const monthKey = enrollment.createdAt.toLocaleDateString('en-US', { month: 'short' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].students++;
      }
    });

    // Count teacher registrations
    teacherRegistrations.forEach(teacher => {
      const monthKey = teacher.createdAt.toLocaleDateString('en-US', { month: 'short' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].teachers++;
      }
    });

    // Convert to array format expected by charts
    const trendsData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      students: data.students,
      teachers: data.teachers,
    }));

    return NextResponse.json(trendsData);
  } catch (error) {
    console.error("Error fetching enrollment trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment trends" },
      { status: 500 },
    );
  }
}