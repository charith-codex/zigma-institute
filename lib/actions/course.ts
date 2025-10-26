"use server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";

export async function getCourses() {
  const data = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

// get single corse by slug
export async function getCourseBySlug(slug: string) {
  return await prisma.course.findFirst({
    where: { slug: slug },
  });
}
