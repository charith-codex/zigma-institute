import { prisma } from "@/db/prisma";
import type { ShowcaseContent, ShowcaseMedia, ShowcasePage } from "@/lib/generated/prisma";
import { convertToPlainObject } from "@/lib/utils";

export type ShowcaseData = {
  contents: ShowcaseContent[];
  media: ShowcaseMedia[];
};

export async function fetchShowcaseData(
  page?: ShowcasePage
): Promise<ShowcaseData> {
  try {
    const [contents, media] = await prisma.$transaction([
      prisma.showcaseContent.findMany({
        where: page ? { page } : undefined,
        orderBy: [
          { page: "asc" },
          { section: "asc" },
          { order: "asc" },
          { createdAt: "asc" },
        ],
      }),
      prisma.showcaseMedia.findMany({
        where: page ? { page } : undefined,
        orderBy: [
          { page: "asc" },
          { section: "asc" },
          { order: "asc" },
          { createdAt: "asc" },
        ],
      }),
    ]);

    return {
      contents: convertToPlainObject(contents),
      media: convertToPlainObject(media),
    };
  } catch (error) {
    console.error("Failed to fetch showcase data", error);
    return { contents: [], media: [] };
  }
}

export async function fetchShowcasePage(
  page: ShowcasePage
): Promise<ShowcaseData> {
  return fetchShowcaseData(page);
}
