import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { createSessionSchema } from "@/lib/validators";

function normalizeDateOnly(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export async function GET() {
  const sessions = await prisma.attendanceSession.findMany({
    orderBy: { sessionDate: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });

  const payload = sessions.map((session) => ({
    id: session.id,
    courseId: session.courseId,
    courseName: session.courseName,
    sessionDate: session.sessionDate,
    totalMarked: session._count.entries,
  }));

  return NextResponse.json(convertToPlainObject(payload));
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = createSessionSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const sessionDate = normalizeDateOnly(result.data.sessionDate);

  if (!sessionDate) {
    return NextResponse.json({ error: "Invalid session date" }, { status: 400 });
  }

  const existing = await prisma.attendanceSession.findFirst({
    where: {
      sessionDate,
      ...(result.data.courseId
        ? { courseId: result.data.courseId }
        : { courseId: null, courseName: result.data.courseName }),
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An attendance session already exists for this course and date" },
      { status: 409 }
    );
  }

  const created = await prisma.attendanceSession.create({
    data: {
      courseId: result.data.courseId ?? null,
      courseName: result.data.courseName,
      sessionDate,
    },
  });

  return NextResponse.json(
    convertToPlainObject({
      id: created.id,
      courseId: created.courseId,
      courseName: created.courseName,
      sessionDate: created.sessionDate,
      totalMarked: 0,
    })
  );
}
