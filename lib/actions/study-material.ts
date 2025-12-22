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

export async function updateStudyMaterial(
  id: string,
  data: { title: string; description?: string | null }
) {
  const updatedMaterial = await prisma.studyMaterial.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
    },
  });

  return convertToPlainObject(updatedMaterial);
}

export async function deleteStudyMaterial(id: string) {
  const deletedMaterial = await prisma.studyMaterial.delete({
    where: { id },
  });

  return convertToPlainObject(deletedMaterial);
}
