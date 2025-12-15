import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { tuteDistributionSchema } from "@/lib/validators";

interface Params {
  tuteId: string;
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const tuteId = params.tuteId?.trim();

  if (!tuteId) {
    return NextResponse.json({ error: "Tute ID is required." }, { status: 400 });
  }

  try {
    const tute = await prisma.tute.findUnique({ where: { id: tuteId } });

    if (!tute) {
      return NextResponse.json({ error: "Tute not found." }, { status: 404 });
    }

    const distributions = await prisma.tuteDistribution.findMany({
      where: { tuteId },
      orderBy: { studentId: "asc" },
    });

    return NextResponse.json(convertToPlainObject(distributions));
  } catch (error) {
    console.error("Failed to load tute distributions", error);
    return NextResponse.json(
      { error: "Unable to load distribution data. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  const tuteId = params.tuteId?.trim();

  if (!tuteId) {
    return NextResponse.json({ error: "Tute ID is required." }, { status: 400 });
  }

  try {
    const payload = await request.json();
    const data = tuteDistributionSchema.parse(payload);

    const tute = await prisma.tute.findUnique({ where: { id: tuteId } });

    if (!tute) {
      return NextResponse.json({ error: "Tute not found." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: data.studentId, courseId: tute.courseId } },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student is not enrolled in the selected course." },
        { status: 400 }
      );
    }

    const distribution = await prisma.tuteDistribution.upsert({
      where: { tuteId_studentId: { tuteId, studentId: data.studentId } },
      update: {
        distributed: data.distributed,
        distributedAt: data.distributed ? new Date() : null,
      },
      create: {
        tuteId,
        studentId: data.studentId,
        distributed: data.distributed,
        distributedAt: data.distributed ? new Date() : null,
      },
    });

    return NextResponse.json(distribution);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to update distribution", error);
    return NextResponse.json(
      { error: "Unable to update distribution. Please try again later." },
      { status: 500 }
    );
  }
}
