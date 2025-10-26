"use server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";
import { LATEST_COURSES_LIMIT } from "../constants";

export async function getCourses() {
  const data = await prisma.course.findMany({
    take: LATEST_COURSES_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}
