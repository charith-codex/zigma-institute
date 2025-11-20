import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { scheduleSchema } from "@/lib/validators";

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { course: { select: { teacherName: true } } },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(convertToPlainObject(schedules));
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
        recurring: data.recurring ?? false,
      },
      include: { course: { select: { teacherName: true } } },
    });

    return NextResponse.json(convertToPlainObject(schedule), { status: 201 });
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
