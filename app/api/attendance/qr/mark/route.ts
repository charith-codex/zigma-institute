import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

const markSchema = z.object({
  sessionId: z.string().min(1),
  studentPublicId: z.string().min(1),
  studentName: z.string().min(1),
  registrationId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = markSchema.safeParse(payload);

  if (!data.success) {
    const message = data.error.issues.map((issue) => issue.message).join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { id: data.data.sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Attendance session not found" }, { status: 404 });
  }

  const normalizedPublicId = data.data.studentPublicId.trim().toUpperCase();

  const registration = await prisma.studentRegistration.findFirst({
    where: {
      OR: [
        { studentPublicId: normalizedPublicId },
        ...(data.data.registrationId ? [{ id: data.data.registrationId }] : []),
      ],
    },
  });

  const studentName = registration?.name ?? data.data.studentName.trim();

  const existing = await prisma.attendanceEntry.findUnique({
    where: {
      sessionId_studentPublicId: {
        sessionId: session.id,
        studentPublicId: normalizedPublicId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      convertToPlainObject({ alreadyMarked: true, entry: existing })
    );
  }

  const entry = await prisma.attendanceEntry.create({
    data: {
      sessionId: session.id,
      studentPublicId: normalizedPublicId,
      studentName,
      registrationId: registration?.id ?? data.data.registrationId ?? null,
    },
  });

  return NextResponse.json(
    convertToPlainObject({ alreadyMarked: false, entry })
  );
}
