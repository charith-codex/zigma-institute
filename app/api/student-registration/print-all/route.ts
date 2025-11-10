import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { APP_NAME } from "@/lib/constants";
import {
  createBulkStudentIdCardsPdf,
  resolveProfileImageBuffer,
} from "@/lib/student-registration/utils";

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

  const students = await prisma.student.findMany({
    where: { idCardUrl: { not: null } },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          profileImage: true,
        },
      },
    },
    orderBy: { studentPublicId: "asc" },
  });

  const cardPayloads = [] as Array<{
    studentName: string;
    studentId: string;
    studentEmail: string;
    studentPhone: string;
    instituteName: string;
    studentPhoto: Buffer;
    profileImageMimeType?: string | null;
  }>;

  for (const student of students) {
    const user = student.user;

    if (!user?.profileImage) {
      continue;
    }

    try {
      const { buffer } = await resolveProfileImageBuffer({
        url: user.profileImage,
        base64: null,
        mimeType: null,
      });

      cardPayloads.push({
        studentName: user.name ?? "Student",
        studentId: student.studentPublicId ?? "",
        studentEmail: user.email ?? "",
        studentPhone: user.phone ?? "",
        instituteName: APP_NAME,
        studentPhoto: buffer,
        profileImageMimeType: "image/jpeg",
      });
    } catch (error) {
      console.warn(
        `Skipping student ${student.userId} due to missing profile image`,
        error
      );
    }
  }

  if (cardPayloads.length === 0) {
    return NextResponse.json(
      { error: "No student ID cards are available" },
      { status: 404 }
    );
  }

  const pdfBuffer = await createBulkStudentIdCardsPdf(cardPayloads);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=student-id-cards.pdf",
    },
  });
}
