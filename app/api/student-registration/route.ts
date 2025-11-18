import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { generateAndUploadIdCard } from "@/lib/student-registration/generate-id-card";

const statusFilterSchema = z
  .array(z.enum(["PENDING", "PAID", "APPROVED", "FAILED"]))
  .nonempty()
  .catch(["PAID", "APPROVED"]);

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PAID", "APPROVED", "FAILED"]),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.getAll("status");
  const statuses = statusFilterSchema.parse(statusParam);

  const registrations = await prisma.studentRegistration.findMany({
    where: {
      status: { in: statuses },
    },
    orderBy: { createdAt: "desc" },
    include: {
      courses: {
        include: {
          course: true,
        },
      },
    },
  });

  const payload = registrations.map((registration) => ({
    id: registration.id,
    name: registration.name,
    email: registration.email,
    phone: registration.phone,
    address: registration.address,
    gender: registration.gender,
    guardianEmail: registration.guardianEmail,
    status: registration.status,
    totalAmountInCents: registration.totalAmountInCents,
    currency: registration.currency,
    createdAt: registration.createdAt,
    idCardUrl: registration.idCardUrl,
    studentPublicId: registration.studentPublicId,
    studentUserId: registration.studentUserId,
    courses: registration.courses
      .map((item) => item.course?.name)
      .filter((name): name is string => Boolean(name)),
  }));

  return NextResponse.json(convertToPlainObject(payload));
}

export async function PATCH(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = updateStatusSchema.safeParse(payload);

  if (!data.success) {
    const message = data.error.issues.map((issue) => issue.message).join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const registration = await prisma.studentRegistration.findUnique({
    where: { id: data.data.id },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const updated = await prisma.studentRegistration.update({
    where: { id: registration.id },
    data: {
      status: data.data.status,
    },
  });

  // When approving a registration, generate ID card if it doesn't exist
  if (data.data.status === "APPROVED" && !registration.idCardUrl) {
    console.log(`Generating missing ID card for registration ${registration.id}`);
    const idCardResult = await generateAndUploadIdCard(registration.id);
    if (!idCardResult.success) {
      console.error(`Failed to generate ID card on approval: ${idCardResult.error}`);
      // Don't fail the approval - ID card can be regenerated later
    }
  }

  return NextResponse.json({ id: updated.id, status: updated.status });
}
