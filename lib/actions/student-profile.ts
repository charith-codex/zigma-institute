"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export type StudentIdCardData = {
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  studentPublicId: string | null;
  idCardUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export async function getStudentIdCardData(): Promise<{
  success: boolean;
  data?: StudentIdCardData;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        status: true,
        role: true,
        student: {
          select: {
            studentPublicId: true,
            idCardUrl: true,
          },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    if (student.role !== "STUDENT") {
      return { success: false, error: "User is not a student" };
    }

    return {
      success: true,
      data: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        profileImage: student.profileImage,
        studentPublicId: student.student?.studentPublicId ?? null,
        idCardUrl: student.student?.idCardUrl ?? null,
        status: student.status,
      },
    };
  } catch (error) {
    console.error("Failed to fetch student ID card data:", error);
    return { success: false, error: "Failed to fetch ID card data" };
  }
}
