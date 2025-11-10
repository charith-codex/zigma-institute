import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { offlineStudentRegistrationSchema } from "@/lib/student-registration/schema";
import { ZodError } from "zod";

const STAFF_ROLES = new Set(["ADMIN", "MANAGER"]);

function isStaff(role?: string | null) {
  if (!role) return false;
  return STAFF_ROLES.has(role.toUpperCase());
}

export async function GET() {
  const session = await auth();

  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registrations = await prisma.pendingStudentRegistration.findMany({
    where: { source: "OFFLINE" },
    include: {
      student: {
        select: {
          studentPublicId: true,
          idCardUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = registrations.reduce(
    (acc, registration) => {
      acc.total += 1;

      switch (registration.status) {
        case "AWAITING_APPROVAL":
          acc.awaitingApproval += 1;
          break;
        case "COMPLETED":
          acc.completed += 1;
          break;
        case "FAILED":
          acc.failed += 1;
          break;
        default:
          break;
      }

      return acc;
    },
    { total: 0, awaitingApproval: 0, completed: 0, failed: 0 }
  );

  return NextResponse.json({
    registrations: registrations.map((registration) => ({
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      status: registration.status,
      notes: registration.notes,
      parentEmail: registration.parentEmail,
      profileImageUrl: registration.profileImageUrl,
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
      studentPublicId: registration.student?.studentPublicId ?? null,
      idCardUrl: registration.student?.idCardUrl ?? null,
    })),
    stats,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = offlineStudentRegistrationSchema.parse(body);

    const registration = await prisma.pendingStudentRegistration.create({
      data: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email.toLowerCase(),
        phone: parsed.phone,
        address: parsed.address,
        parentEmail: parsed.parentEmail ?? null,
        dob: parsed.dob ? new Date(parsed.dob) : null,
        notes: parsed.notes ?? null,
        profileImageUrl: parsed.profileImage.url,
        profileImageFileKey: parsed.profileImage.fileKey,
        profileImageMimeType: parsed.profileImage.mimeType ?? "image/jpeg",
        status: "AWAITING_APPROVAL",
        source: "OFFLINE",
      },
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid registration payload" },
        { status: 400 }
      );
    }

    console.error("Failed to create offline registration", error);
    return NextResponse.json(
      { error: "Unable to create offline registration" },
      { status: 500 }
    );
  }
}
