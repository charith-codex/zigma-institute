"use server";

import { prisma } from "@/db/prisma";

export async function getVideoRecordings(lessonId: string) {
  const recordings = await prisma.videoRecording.findMany({
    where: { lessonId },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return recordings;
}

export async function createVideoRecording(input: {
  title: string;
  description?: string | null;
  fileUrl: string;
  uploadedById?: string | null;
  lessonId: string;
}) {
  const { title, description, fileUrl, uploadedById, lessonId } = input;

  const created = await prisma.videoRecording.create({
    data: {
      title,
      description: description ?? null,
      fileUrl,
      uploadedById: uploadedById ?? null,
      lessonId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
    },
  });

  return created;
}

export async function updateVideoRecording(
  id: string,
  data: { title: string; description?: string | null }
) {
  const updated = await prisma.videoRecording.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
    },
  });

  return updated;
}

export async function deleteVideoRecording(id: string) {
  const deleted = await prisma.videoRecording.delete({
    where: { id },
    select: {
      id: true,
    },
  });

  return deleted;
}
