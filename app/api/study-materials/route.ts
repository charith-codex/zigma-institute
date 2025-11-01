import { NextResponse } from "next/server";

import { getStudyMaterials } from "@/lib/actions/study-material";

export async function GET() {
  try {
    const materials = await getStudyMaterials();
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Failed to fetch study materials", error);
    return NextResponse.json(
      { error: "Failed to fetch study materials" },
      { status: 500 }
    );
  }
}
