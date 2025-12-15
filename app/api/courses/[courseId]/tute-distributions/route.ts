import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

interface Params {
  courseId: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { courseId: rawCourseId } = await params;
  const courseId = rawCourseId?.trim();

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required." },
      { status: 400 }
    );
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const distributions = await prisma.tuteDistribution.findMany({
      where: { tute: { courseId }, distributed: true },
      include: { tute: true },
      orderBy: { distributedAt: "desc" },
    });

    const ledger = distributions.reduce<
      Record<
        string,
        {
          studentId: string;
          tutes: { id: string; name: string; distributedAt: Date | null }[];
        }
      >
    >((acc, entry) => {
      const existing = acc[entry.studentId]?.tutes ?? [];

      acc[entry.studentId] = {
        studentId: entry.studentId,
        tutes: [
          ...existing,
          {
            id: entry.tuteId,
            name: entry.tute.name,
            distributedAt: entry.distributedAt,
          },
        ],
      };

      return acc;
    }, {});

    return NextResponse.json(convertToPlainObject(Object.values(ledger)));
  } catch (error) {
    console.error("Failed to load course tute distributions", error);
    return NextResponse.json(
      {
        error:
          "Unable to load course tute distributions. Please try again later.",
      },
      { status: 500 }
    );
  }
}
