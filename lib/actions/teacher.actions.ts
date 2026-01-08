"use server";

import { prisma } from "@/db/prisma";

export interface TeacherWithCourses {
  userId: string;
  qualification: string | null;
  nic: string | null;
  user: {
    name: string;
    profileImage: string | null;
  };
  courses: {
    name: string;
    slug: string;
  }[];
}

export async function getTeachersWithCourses(
  page: number = 1,
  pageSize: number = 8
) {
  try {
    const skip = (page - 1) * pageSize;

    const [teachers, totalCount] = await Promise.all([
      prisma.teacher.findMany({
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          courses: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.teacher.count(),
    ]);

    return {
      teachers,
      metadata: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return {
      teachers: [],
      metadata: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize,
      },
    };
  }
}
