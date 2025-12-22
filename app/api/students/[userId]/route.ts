import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Only allow students to fetch their own ID, or teachers/admins to fetch any?
    // For now, let's keep it simple: any authenticated user
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { studentPublicId: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Failed to fetch student", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
