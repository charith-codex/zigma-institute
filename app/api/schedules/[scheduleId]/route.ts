import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { scheduleUpdateSchema } from "@/lib/validators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

interface RouteContext {
  params: Promise<{ scheduleId: string }>;
}

function toDateOnly(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000Z`);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { scheduleId } = await params;

  if (!scheduleId) {
    return NextResponse.json(
      { error: "Schedule ID is required." },
      { status: 400 }
    );
  }

  try {
    const payload = await request.json();
    const updates = scheduleUpdateSchema.parse(payload);

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        ...updates,
        date: toDateOnly(updates.date),
        notes: updates.notes?.trim(),
      },
      include: { course: { select: { teacherName: true } } },
    });

    return NextResponse.json(convertToPlainObject(updatedSchedule));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Schedule not found." },
        { status: 404 }
      );
    }

    console.error("Failed to update schedule", error);
    return NextResponse.json(
      { error: "Unable to update schedule. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { scheduleId } = await params;

  if (!scheduleId) {
    return NextResponse.json(
      { error: "Schedule ID is required." },
      { status: 400 }
    );
  }

  try {
    const deletedSchedule = await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json(convertToPlainObject(deletedSchedule));
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Schedule not found." },
        { status: 404 }
      );
    }

    console.error("Failed to delete schedule", error);
    return NextResponse.json(
      { error: "Unable to delete schedule. Please try again later." },
      { status: 500 }
    );
  }
}
