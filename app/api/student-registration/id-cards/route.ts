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
const INSTITUTE_TAGLINE =
  "AI-powered personalised learning for ambitious students.";
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
    return NextResponse.json(
      { error: "No registrations found" },
      { status: 404 }
    );
  }

  const contexts = [];

  for (const registration of registrations) {
    // Skip if no student ID assigned yet (payment not completed)
    if (!registration.studentPublicId) {
      continue;
    }

    // Generate ID card on-the-fly (works even if idCardUrl is missing)
    const cardData = {
      studentName: registration.name,
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
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
      { error: "No valid registrations found. Please ensure students have completed payment and have a student ID assigned." },
      { status: 400 }
    );
  }

  const pdfBytes = renderStudentIdCardsPdf(contexts);
  const blob = new Blob([Uint8Array.from(pdfBytes)], {
    type: "application/pdf",
  });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=zigma-id-cards.pdf",
    },
  });
}
