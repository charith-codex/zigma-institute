import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { scheduleSchema } from "@/lib/validators";
import { auth } from "@/auth";

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user;
    const isAdmin = role === "ADMIN" || role === "MANAGER";
    const isStudent = role === "STUDENT";

    const where: any = {};

    if (isStudent) {
      where.course = {
        enrollments: {
          some: {
            studentId: userId,
            isActive: true,
          },
        },
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        course: { select: { name: true, teacherName: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      courseName: schedule.course.name,
    }));

    return NextResponse.json(convertToPlainObject(formattedSchedules));
  } catch (error) {
    console.error("Failed to load schedules", error);
    return NextResponse.json(
      { error: "Unable to load schedules. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = scheduleSchema.parse(payload);

    const schedule = await prisma.schedule.create({
      data: {
        ...data,
        date: toDateOnly(data.date),
        notes: data.notes?.trim() || undefined,
      },
      include: {
        course: { select: { name: true, teacherName: true } },
      },
    });

    const formattedSchedule = {
      ...schedule,
      courseName: schedule.course.name,
    };

    return NextResponse.json(convertToPlainObject(formattedSchedule), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create schedule", error);
    return NextResponse.json(
      { error: "Unable to create schedule. Please try again later." },
      { status: 500 }
    );
  }
}
