import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { courseSchema } from "@/lib/validators";

const DEFAULT_CURRENCY = "usd";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = courseSchema.parse(payload);

    const existing = await prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A course with this slug already exists." },
        { status: 409 }
      );
    }

    const { price, ...courseData } = data;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        priceInCents: Math.round(price * 100),
        currency: DEFAULT_CURRENCY,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to create course", error);
    return NextResponse.json(
      { error: "Unable to create course. Please try again later." },
      { status: 500 }
    );
  }
}
