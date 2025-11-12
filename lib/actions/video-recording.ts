"use server";

import { prisma } from "@/db/prisma";

export async function getVideoRecordings() {
  const recordings = await prisma.videoRecording.findMany({
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
  lessonId?: string | null;
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
      lessonId: lessonId ?? null,
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
