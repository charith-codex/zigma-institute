"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import type { ShowcaseContent, ShowcaseMedia, ShowcasePage } from "@/lib/generated/prisma";
import { fetchShowcaseData } from "@/lib/showcase-data";
import { convertToPlainObject } from "@/lib/utils";

const pageSchema = z.enum(["HOME", "COURSES", "GALLERY", "CONTACT", "ABOUT"]);

const contentSchema = z.object({
  id: z.string().optional(),
  page: pageSchema,
  section: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  order: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const mediaSchema = z.object({
  id: z.string().optional(),
  page: pageSchema,
  section: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  year: z.number().int().min(0).max(9999).optional(),
  imageUrl: z.string().url(),
  imageKey: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

type ShowcaseData = {
  contents: ShowcaseContent[];
  media: ShowcaseMedia[];
};

const revalidateShowcasePages = () => {
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/gallery");
  revalidatePath("/contact");
  revalidatePath("/about");
};

export async function getShowcaseData(
  page?: ShowcasePage
): Promise<ShowcaseData> {
  return fetchShowcaseData(page);
}

export async function saveShowcaseContent(
  input: z.infer<typeof contentSchema>
): Promise<ActionResult<ShowcaseContent>> {
  try {
    const payload = contentSchema.parse(input);
    const metadataValue: Prisma.InputJsonValue | undefined =
      payload.metadata === undefined ? undefined : payload.metadata;
    const data = {
      page: payload.page,
      section: payload.section,
      title: payload.title ?? null,
      subtitle: payload.subtitle ?? null,
      body: payload.body ?? null,
      ctaLabel: payload.ctaLabel ?? null,
      ctaHref: payload.ctaHref ?? null,
      order: payload.order,
      ...(metadataValue !== undefined ? { metadata: metadataValue } : {}),
    };

    const record = payload.id
      ? await prisma.showcaseContent.update({
          where: { id: payload.id },
          data,
        })
      : await prisma.showcaseContent.create({ data });

    revalidateShowcasePages();
    return { success: true, data: convertToPlainObject(record) };
  } catch (error) {
    console.error("Failed to save showcase content", error);
    return { success: false, error: "Unable to save content" };
  }
}

export async function deleteShowcaseContent(
  id: string
): Promise<ActionResult<string>> {
  try {
    await prisma.showcaseContent.delete({ where: { id } });
    revalidateShowcasePages();
    return { success: true, data: id };
  } catch (error) {
    console.error("Failed to delete showcase content", error);
    return { success: false, error: "Unable to delete content" };
  }
}

export async function saveShowcaseMedia(
  input: z.infer<typeof mediaSchema>
): Promise<ActionResult<ShowcaseMedia>> {
  try {
    const payload = mediaSchema.parse(input);
    const data = {
      page: payload.page,
      section: payload.section,
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category ?? null,
      year: payload.year ?? null,
      imageUrl: payload.imageUrl,
      imageKey: payload.imageKey ?? null,
      order: payload.order,
    };

    const record = payload.id
      ? await prisma.showcaseMedia.update({ where: { id: payload.id }, data })
      : await prisma.showcaseMedia.create({ data });

    revalidateShowcasePages();
    return { success: true, data: convertToPlainObject(record) };
  } catch (error) {
    console.error("Failed to save showcase media", error);
    return { success: false, error: "Unable to save media" };
  }
}

export async function deleteShowcaseMedia(
  id: string
): Promise<ActionResult<string>> {
  try {
    await prisma.showcaseMedia.delete({ where: { id } });
    revalidateShowcasePages();
    return { success: true, data: id };
  } catch (error) {
    console.error("Failed to delete showcase media", error);
    return { success: false, error: "Unable to delete media" };
  }
}
