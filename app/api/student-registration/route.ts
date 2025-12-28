import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { generateAndUploadIdCard } from "@/lib/student-registration/generate-id-card";
import { statusFilterSchema, updateStatusSchema } from "@/lib/validators";

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
    qrCodeUrl: registration.qrCodeUrl,
    studentPublicId: registration.studentPublicId,
    studentUserId: registration.studentUserId,
    courses: registration.courses
      .map((item) => item.course?.name)
      .filter((name): name is string => Boolean(name)),
  }));

  return NextResponse.json(convertToPlainObject(payload));
}
