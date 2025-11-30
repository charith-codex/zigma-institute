import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

const sessionIdSchema = z.object({
  sessionId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  const validation = sessionIdSchema.safeParse({ sessionId });

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid session ID" },
      { status: 400 }
    );
  }

  const registration = await prisma.studentRegistration.findUnique({
    where: {
      stripeSessionId: validation.data.sessionId,
    },
    include: {
      courses: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  const payload = {
    id: registration.id,
    name: registration.name,
    email: registration.email,
    studentPublicId: registration.studentPublicId,
    idCardUrl: registration.idCardUrl,
    qrCodeUrl: registration.qrCodeUrl,
    status: registration.status,
    courses: registration.courses
      .map((item) => item.course?.name)
      .filter((name): name is string => Boolean(name)),
  };

  return NextResponse.json(convertToPlainObject(payload));
}
