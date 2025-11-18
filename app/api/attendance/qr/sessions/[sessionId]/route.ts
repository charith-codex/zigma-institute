import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

const paramsSchema = z.object({
  sessionId: z.string().min(1),
});

export async function GET(
  _request: Request,
  context: { params: { sessionId: string } }
) {
  const validation = paramsSchema.safeParse(context.params);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { id: validation.data.sessionId },
    include: {
      entries: {
        orderBy: { markedAt: "desc" },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const payload = {
    id: session.id,
    courseId: session.courseId,
    courseName: session.courseName,
    sessionDate: session.sessionDate,
    entries: session.entries,
  };

  return NextResponse.json(convertToPlainObject(payload));
}
