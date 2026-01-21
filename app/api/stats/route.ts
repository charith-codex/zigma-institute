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

    // Get counts
    const [studentCount, teacherCount, staffCount, activeCourses] =
      await Promise.all([
        prisma.user.count({
          where: { role: "STUDENT" },
        }),
        prisma.user.count({
          where: { role: "TEACHER" },
        }),
        prisma.user.count({
          where: {
            role: {
              in: ["ADMIN", "MANAGER", "ATTENDANCE"],
            },
          },
        }),
        prisma.course.count(),
      ]);

    return NextResponse.json({
      studentCount,
      teacherCount,
      staffCount,
      activeClasses: activeCourses,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
