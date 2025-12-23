import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const { enrollmentId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "MANAGER";

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can update enrollment status." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive field is required and must be a boolean." },
        { status: 400 }
      );
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { isActive },
    });

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error("Failed to update enrollment status:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment status." },
      { status: 500 }
    );
  }
}
