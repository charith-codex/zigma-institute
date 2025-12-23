import { NextResponse } from "next/server";
import { getStudyMaterials } from "@/lib/actions/study-material";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const lessonId = url.searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    const { role, id: userId } = session.user;
    const isStudent = role === "STUDENT";

    if (isStudent) {
      // Check if student is enrolled and active in the course for this lesson
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
          course: {
            select: {
              enrollments: {
                where: {
                  studentId: userId,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!lesson || !lesson.course.enrollments.length) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const materials = await getStudyMaterials(lessonId);
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Failed to fetch study materials", error);
    return NextResponse.json(
      { error: "Failed to fetch study materials" },
      { status: 500 }
    );
  }
}
