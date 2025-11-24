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
  courseId?: string | null;
  lessonId: string;
}) {
  const { title, description, fileUrl, uploadedById, courseId, lessonId } =
    input;

  const created = await prisma.videoRecording.create({
    data: {
      title,
      description: description ?? null,
      fileUrl,
      uploadedById: uploadedById ?? null,
      courseId: courseId ?? null,
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
