"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import {
  courseCategorySchema,
  courseCategoryIdSchema,
  courseCategoryWithIdSchema,
} from "@/lib/validators";
import type { ActionState } from "./user";

const baseState: ActionState = { success: false, message: "" };

const successState = (message: string): ActionState => ({
  success: true,
  message,
});

const failureState = (message: string): ActionState => ({
  success: false,
  message,
});

const revalidateDashboard = () => {
  revalidatePath("/dashboard");
  revalidatePath("/api/course-categories");
};

export async function createCourseCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = courseCategorySchema.parse({
      name: formData.get("name"),
    });

    const exists = await prisma.courseCategory.findUnique({
      where: { name: parsed.name },
    });

    if (exists) {
      return failureState("A category with this name already exists.");
    }

    await prisma.courseCategory.create({
      data: parsed,
    });

    revalidateDashboard();

    return successState("Course category created.");
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return failureState("Unable to create category. Please try again.");
    }

    if (error instanceof Error) {
      return failureState(error.message);
    }

    return failureState("An unexpected error occurred.");
  }
}

export async function updateCourseCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = courseCategoryWithIdSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
    });

    const conflicting = await prisma.courseCategory.findFirst({
      where: {
        name: parsed.name,
        NOT: { id: parsed.id },
      },
    });

    if (conflicting) {
      return failureState("Another category with this name already exists.");
    }

    await prisma.courseCategory.update({
      where: { id: parsed.id },
      data: { name: parsed.name },
    });

    revalidateDashboard();

    return successState("Course category updated.");
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return failureState("Unable to update category. Please try again.");
    }

    if (error instanceof Error) {
      return failureState(error.message);
    }

    return baseState;
  }
}

export async function deleteCourseCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { id } = courseCategoryIdSchema.parse({
      id: formData.get("id"),
    });

    await prisma.courseCategory.delete({
      where: { id },
    });

    revalidateDashboard();

    return successState("Course category deleted.");
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return failureState(
        "Cannot delete a category while courses are assigned to it."
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return failureState("Unable to delete category. Please try again.");
    }

    if (error instanceof Error) {
      return failureState(error.message);
    }

    return baseState;
  }
}
