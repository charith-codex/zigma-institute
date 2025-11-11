import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import {
  prepareStudentIdCardAssets,
  renderStudentIdCardsPdf,
} from "@/lib/student-registration/id-card";

const requestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

const INSTITUTE_NAME = "Zigma Institute";
const INSTITUTE_TAGLINE = "AI-powered personalised learning for ambitious students.";
const INSTITUTE_ADDRESS = "Colombo Innovation Hub, 512 Galle Road, Colombo 03";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = requestSchema.safeParse(payload);
  if (!data.success) {
    const message = data.error.issues.map((issue) => issue.message).join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const registrations = await prisma.studentRegistration.findMany({
    where: { id: { in: data.data.ids } },
    include: {
      courses: {
        include: {
          course: true,
        },
      },
    },
  });

  if (registrations.length === 0) {
    return NextResponse.json({ error: "No registrations found" }, { status: 404 });
  }

  const contexts = [];

  for (const registration of registrations) {
    if (!registration.studentPublicId || !registration.idCardUrl) {
      continue;
    }

    const cardData = {
      studentName: `${registration.firstName} ${registration.lastName}`.trim(),
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianName: registration.guardianName,
      courses: registration.courses
        .map((item) => item.course?.name)
        .filter((name): name is string => Boolean(name)),
      instituteName: INSTITUTE_NAME,
      instituteTagline: INSTITUTE_TAGLINE,
      instituteAddress: INSTITUTE_ADDRESS,
      studentPhotoUrl: registration.studentPhotoUrl,
    };

    const assets = await prepareStudentIdCardAssets(cardData);
    contexts.push({ data: cardData, assets });
  }

  if (contexts.length === 0) {
    return NextResponse.json(
      { error: "Selected registrations do not have generated ID cards" },
      { status: 400 }
    );
  }

  const pdfBytes = renderStudentIdCardsPdf(contexts);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=zigma-id-cards.pdf",
    },
  });
}
