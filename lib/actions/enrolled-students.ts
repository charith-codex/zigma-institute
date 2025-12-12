"use server";

import { prisma } from "@/db/prisma";

export interface EnrolledStudentData {
  userId: string;
  studentPublicId: string | null;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  enrolledAt: Date;
}

export async function getEnrolledStudents(
  courseId: string
): Promise<EnrolledStudentData[]> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return enrollments.map((enrollment) => ({
      userId: enrollment.student.user.id,
      studentPublicId: enrollment.student.studentPublicId,
      name: enrollment.student.user.name,
      email: enrollment.student.user.email,
      phone: enrollment.student.user.phone,
      profileImage: enrollment.student.user.profileImage,
      enrolledAt: enrollment.enrolledAt,
    }));
  } catch (error) {
    console.error("Failed to fetch enrolled students:", error);
    throw new Error("Failed to fetch enrolled students");
  }
}
