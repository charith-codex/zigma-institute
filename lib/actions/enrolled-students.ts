"use server";

import { auth } from "@/auth";
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

export async function getEnrolledStudents(params: {
  courseId: string;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}): Promise<{ data: EnrolledStudentData[]; totalCount: number }> {
  const session = await auth();
  if (
    !session?.user?.role ||
    !["ADMIN", "MANAGER"].includes(session.user.role)
  ) {
    throw new Error("Unauthorized");
  }

  const { courseId, page = 1, pageSize = 50, searchTerm } = params;
  const skip = (page - 1) * pageSize;

  try {
    const where: any = {
      courseId,
    };

    if (searchTerm) {
      where.student = {
        user: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      };
    }

    const [enrollments, totalCount] = await Promise.all([
      prisma.enrollment.findMany({
        where,
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
        skip,
        take: pageSize,
      }),
      prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments.map((enrollment) => ({
        userId: enrollment.student.user.id,
        studentPublicId: enrollment.student.studentPublicId,
        name: enrollment.student.user.name,
        email: enrollment.student.user.email,
        phone: enrollment.student.user.phone,
        profileImage: enrollment.student.user.profileImage,
        enrolledAt: enrollment.enrolledAt,
      })),
      totalCount,
    };
  } catch (error) {
    console.error("Failed to fetch enrolled students:", error);
    throw new Error("Failed to fetch enrolled students");
  }
}
