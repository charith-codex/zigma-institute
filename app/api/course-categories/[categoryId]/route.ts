import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ZodError } from "zod";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { courseCategorySchema } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ categoryId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { categoryId } = await params;

  try {
    const payload = await request.json();
    const data = courseCategorySchema.parse(payload);

    const conflicting = await prisma.courseCategory.findFirst({
      where: {
        name: data.name,
        NOT: { id: categoryId },
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "Another category with this name already exists." },
        { status: 409 }
      );
    }

    const updated = await prisma.courseCategory.update({
      where: { id: categoryId },
      data,
    });

    return NextResponse.json(convertToPlainObject(updated));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Unable to update course category." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { categoryId } = await params;

  try {
    const deleted = await prisma.courseCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json(convertToPlainObject(deleted));
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Cannot delete a category while courses are assigned to it.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to delete course category." },
      { status: 500 }
    );
  }
}
