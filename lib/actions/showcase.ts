"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

import { prisma } from "@/db/prisma";
import type { ActionState } from "./user";
import {
  instituteAchievementFormSchema,
  instituteAchievementUpdateSchema,
  showcaseStudentFormSchema,
  showcaseStudentUpdateSchema,
} from "@/lib/validators";

const initialState: ActionState = { success: false, message: "" };

const toStringValue = (value: FormDataEntryValue | null): string => {
  return typeof value === "string" ? value : "";
};

const revalidateShowcase = () => {
  revalidatePath("/dashboard");
  revalidatePath("/gallery");
  revalidatePath("/api/showcase");
};

export async function createShowcaseStudent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = showcaseStudentFormSchema.parse({
      name: toStringValue(formData.get("name")).trim(),
      grade: toStringValue(formData.get("grade")).trim(),
      subject: toStringValue(formData.get("subject")).trim(),
      position: toStringValue(formData.get("position")).trim(),
      score: toStringValue(formData.get("score")).trim() || undefined,
      year: toStringValue(formData.get("year")),
      district: toStringValue(formData.get("district")).trim() || undefined,
      avatarUrl: toStringValue(formData.get("avatarUrl")).trim() || undefined,
      category: toStringValue(formData.get("category")),
      sortOrder: toStringValue(formData.get("sortOrder")) || "0",
    });

    await prisma.showcaseStudent.create({
      data: parsed,
    });

    revalidateShowcase();

    return { success: true, message: "Showcase student saved." };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { success: false, message: "Unable to save showcase student." };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return initialState;
  }
}

export async function updateShowcaseStudent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = showcaseStudentUpdateSchema.parse({
      id: toStringValue(formData.get("id")),
      name: toStringValue(formData.get("name")).trim(),
      grade: toStringValue(formData.get("grade")).trim(),
      subject: toStringValue(formData.get("subject")).trim(),
      position: toStringValue(formData.get("position")).trim(),
      score: toStringValue(formData.get("score")).trim() || undefined,
      year: toStringValue(formData.get("year")),
      district: toStringValue(formData.get("district")).trim() || undefined,
      avatarUrl: toStringValue(formData.get("avatarUrl")).trim() || undefined,
      category: toStringValue(formData.get("category")),
      sortOrder: toStringValue(formData.get("sortOrder")) || "0",
    });

    await prisma.showcaseStudent.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        grade: parsed.grade,
        subject: parsed.subject,
        position: parsed.position,
        score: parsed.score,
        year: parsed.year,
        district: parsed.district,
        avatarUrl: parsed.avatarUrl,
        category: parsed.category,
        sortOrder: parsed.sortOrder,
      },
    });

    revalidateShowcase();

    return { success: true, message: "Showcase student updated." };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { success: false, message: "Unable to update showcase student." };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return initialState;
  }
}

export async function deleteShowcaseStudent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = toStringValue(formData.get("id"));

    await prisma.showcaseStudent.delete({
      where: { id },
    });

    revalidateShowcase();

    return { success: true, message: "Showcase student removed." };
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, message: "Student already removed." };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return initialState;
  }
}

export async function createInstituteAchievement(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = instituteAchievementFormSchema.parse({
      title: toStringValue(formData.get("title")).trim(),
      category: toStringValue(formData.get("category")).trim(),
      year: toStringValue(formData.get("year")),
      description: toStringValue(formData.get("description")).trim(),
      icon: toStringValue(formData.get("icon")),
      accentColor: toStringValue(formData.get("accentColor")) || "yellow",
      sortOrder: toStringValue(formData.get("sortOrder")) || "0",
    });

    await prisma.instituteAchievement.create({
      data: parsed,
    });

    revalidateShowcase();

    return { success: true, message: "Achievement saved." };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { success: false, message: "Unable to save achievement." };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return initialState;
  }
}

export async function updateInstituteAchievement(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = instituteAchievementUpdateSchema.parse({
      id: toStringValue(formData.get("id")),
      title: toStringValue(formData.get("title")).trim(),
      category: toStringValue(formData.get("category")).trim(),
      year: toStringValue(formData.get("year")),
      description: toStringValue(formData.get("description")).trim(),
      icon: toStringValue(formData.get("icon")),
      accentColor: toStringValue(formData.get("accentColor")) || "yellow",
      sortOrder: toStringValue(formData.get("sortOrder")) || "0",
    });

    await prisma.instituteAchievement.update({
      where: { id: parsed.id },
      data: {
        title: parsed.title,
        category: parsed.category,
        year: parsed.year,
        description: parsed.description,
        icon: parsed.icon,
        accentColor: parsed.accentColor,
        sortOrder: parsed.sortOrder,
      },
    });

    revalidateShowcase();

    return { success: true, message: "Achievement updated." };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { success: false, message: "Unable to update achievement." };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return initialState;
  }
}

export async function deleteInstituteAchievement(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = toStringValue(formData.get("id"));

    await prisma.instituteAchievement.delete({
      where: { id },
    });

    revalidateShowcase();

    return { success: true, message: "Achievement removed." };
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, message: "Achievement already removed." };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return initialState;
  }
}

export const showcaseActionInitialState = initialState;
