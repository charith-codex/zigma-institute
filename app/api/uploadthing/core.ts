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
  studyMaterialUploader: f({
    blob: {
      maxFileSize: "64MB",
    },
  })
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
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
        },
      });

      return { uploadedBy: metadata.userId, materialId: material.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
