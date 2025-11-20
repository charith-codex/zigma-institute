"use server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";

export async function getStudyMaterials(lessonId: string) {
  const materials = await prisma.studyMaterial.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(materials);
}
