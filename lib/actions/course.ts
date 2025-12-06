"use server";

import type { Course } from "@/lib/generated/prisma/client";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";

type CourseResult = Promise<Course | null>;

export async function getCourses(): Promise<Course[]> {
  try {
    const data = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });

    return convertToPlainObject<Course[]>(data);
  } catch (error) {
    console.error("Failed to load courses", error);
    return [];
  }
}

// get single corse by slug
export async function getCourseBySlug(slug: string): CourseResult {
  try {
    const course = await prisma.course.findFirst({
      where: { slug: slug },
    });

    return convertToPlainObject<Course | null>(course);
  } catch (error) {
    console.error(`Failed to load course with slug ${slug}`, error);
    return null;
  }
}
