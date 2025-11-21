import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { z } from "zod";
import { prisma } from "@/db/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
    },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");
      return { userId: session?.user?.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
  studentRegistrationPhoto: f({
    image: {
      maxFileSize: "4MB",
    },
  })
    .onUploadComplete(async ({ file }) => {
      if (!file.type?.includes("jpeg")) {
        throw new UploadThingError("Student photo must be a JPEG image");
      }
      return { url: file.url, key: file.key };
    }),
  studyMaterialUploader: f({
    blob: {
      maxFileSize: "64MB",
    },
  })
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        lessonId: z.string().min(1, "lessonId is required"),
      })
    )
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        userId: session.user.id,
        title: input.title,
        description: input.description,
        lessonId: input.lessonId,
      };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const material = await prisma.studyMaterial.create({
        data: {
          title: metadata.title,
          description: metadata.description ?? null,
          fileUrl: file.url,
          fileKey: file.key,
          fileName: file.name,
          fileSize: file.size,
          uploadedById: metadata.userId,
          lessonId: metadata.lessonId,
        },
      });

      return { uploadedBy: metadata.userId, materialId: material.id };
    }),
  physicalExamPaper: f({
    blob: {
      maxFileSize: "64MB",
    },
  })
    .input(
      z.object({
        courseId: z.string().min(1, "courseId is required"),
        examTitle: z.string().min(1, "examTitle is required"),
      })
    )
    .middleware(async ({ input }) => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        userId: session.user.id,
        courseId: input.courseId,
        examTitle: input.examTitle,
      };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const material = await prisma.studyMaterial.create({
        data: {
          title: metadata.examTitle,
          description: null,
          fileUrl: file.url,
          fileKey: file.key,
          fileName: file.name,
          fileSize: file.size,
          uploadedById: metadata.userId,
          courseId: metadata.courseId,
          lessonId: null,
        },
      });

      return {
        uploadedBy: metadata.userId,
        materialId: material.id,
        fileUrl: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
