"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { lessonSchema } from "@/lib/validators/courses";
import type { Lesson } from "@/lib/generated/prisma/client";

export async function getLessons(courseId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const role = session.user.role ?? null;
    const filters: Record<string, unknown>[] = [{ courseId }];

    if (role !== "ADMIN") {
      filters.push({ course: { teacherId: session.user.id } });
    }

    const where = filters.length > 0 ? { AND: filters } : undefined;

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return convertToPlainObject<Lesson[]>(lessons);
  } catch (error) {
    console.error("Failed to load lessons", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to load lessons"
    );
  }
}

export async function createLesson(data: {
  title: string;
  description?: string | null;
  courseId: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedData = lessonSchema.parse(data);

    // Check if course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new Error("Selected course could not be found.");
    }

    const role = session.user.role ?? null;

    if (role !== "ADMIN" && course.teacherId !== session.user.id) {
      throw new Error(
        "You do not have permission to add lessons to this course."
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: validatedData.title,
        description: validatedData.description ?? null,
        courseId: validatedData.courseId,
      },
    });

    revalidatePath(`/lms-cms/${validatedData.courseId}`);
    revalidatePath("/lms-cms");

    return convertToPlainObject<Lesson>(lesson);
  } catch (error) {
    console.error("Failed to create lesson", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create lesson"
    );
  }
}

export async function updateLesson(
  lessonId: string,
  data: {
    title: string;
    description?: string | null;
    courseId: string;
  }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedData = lessonSchema.parse(data);

    // Check if lesson exists and user has permission
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { teacherId: true } } },
    });

    if (!lesson) {
      throw new Error("Lesson not found.");
    }

    const role = session.user.role ?? null;

    if (role !== "ADMIN" && lesson.course.teacherId !== session.user.id) {
      throw new Error("You do not have permission to update this lesson.");
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: validatedData.title,
        description: validatedData.description ?? null,
        courseId: validatedData.courseId,
      },
    });

    revalidatePath(`/lms-cms/${validatedData.courseId}`);
    revalidatePath("/lms-cms");

    return convertToPlainObject<Lesson>(updatedLesson);
  } catch (error) {
    console.error("Failed to update lesson", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update lesson"
    );
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if lesson exists and user has permission
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { teacherId: true, id: true } } },
    });

    if (!lesson) {
      throw new Error("Lesson not found.");
    }

    const role = session.user.role ?? null;

    if (role !== "ADMIN" && lesson.course.teacherId !== session.user.id) {
      throw new Error("You do not have permission to delete this lesson.");
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    revalidatePath(`/lms-cms/${lesson.course.id}`);
    revalidatePath("/lms-cms");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete lesson", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete lesson"
    );
  }
}
