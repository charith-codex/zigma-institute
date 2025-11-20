import { NextResponse } from "next/server";

import { getStudyMaterials } from "@/lib/actions/study-material";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    const materials = await getStudyMaterials(lessonId);
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Failed to fetch study materials", error);
    return NextResponse.json(
      { error: "Failed to fetch study materials" },
      { status: 500 }
    );
  }
}
