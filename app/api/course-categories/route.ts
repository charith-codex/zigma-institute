import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { courseCategorySchema } from "@/lib/validators";

export async function GET() {
  try {
    const categories = await prisma.courseCategory.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(convertToPlainObject(categories));
  } catch (error) {
    console.error("Failed to load course categories", error);
    return NextResponse.json(
      { error: "Unable to load course categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = courseCategorySchema.parse(payload);

    const existing = await prisma.courseCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }

    const category = await prisma.courseCategory.create({
      data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create course category", error);
    return NextResponse.json(
      { error: "Unable to create course category." },
      { status: 500 }
    );
  }
}
