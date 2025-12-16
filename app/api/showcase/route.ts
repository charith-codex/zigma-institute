import { NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

export async function GET() {
  try {
    const [students, achievements] = await Promise.all([
      prisma.showcaseStudent.findMany({
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.instituteAchievement.findMany({
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      }),
    ]);

    return NextResponse.json(
      convertToPlainObject({ students, achievements })
    );
  } catch (error) {
    console.error("Failed to load showcase entries", error);
    return NextResponse.json(
      { error: "Unable to load showcase entries." },
      { status: 500 }
    );
  }
}
