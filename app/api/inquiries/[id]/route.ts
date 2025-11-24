import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { updateInquiryStatusSchema } from "@/lib/validators/inquiries";
import type { InquiryRecord } from "@/types/inquiries";

const serializeInquiry = (inquiry: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: string;
  response: string | null;
  respondedAt: Date | null;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}): InquiryRecord => ({
  id: inquiry.id,
  name: inquiry.name,
  email: inquiry.email,
  subject: inquiry.subject,
  message: inquiry.message,
  inquiryType: inquiry.inquiryType as InquiryRecord["inquiryType"],
  status: inquiry.status as InquiryRecord["status"],
  response: inquiry.response,
  respondedAt: inquiry.respondedAt?.toISOString() ?? null,
  assignedTo: inquiry.assignedTo,
  submittedAt: inquiry.createdAt.toISOString(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const data = updateInquiryStatusSchema.parse(payload);

    const { id } = await context.params;

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status: data.status },
    });

    return NextResponse.json(convertToPlainObject(serializeInquiry(updated)));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Inquiry not found." },
        { status: 404 }
      );
    }

    console.error("Failed to update inquiry", error);
    return NextResponse.json(
      { error: "Unable to update inquiry status." },
      { status: 500 }
    );
  }
}
