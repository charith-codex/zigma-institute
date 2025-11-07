import { NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    const normalized = teachers
      .filter((teacher) => Boolean(teacher.user))
      .map((teacher) => ({
        id: teacher.userId,
        name: teacher.user?.name ?? "Unnamed teacher",
        email: teacher.user?.email ?? null,
      }));

    return NextResponse.json(convertToPlainObject(normalized));
  } catch (error) {
    console.error("Failed to load teachers", error);
    return NextResponse.json(
      { error: "Unable to load teachers. Please try again later." },
      { status: 500 }
    );
  }
}
