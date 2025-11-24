import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { respondToInquirySchema } from "@/lib/validators/inquiries";
import type { InquiryRecord } from "@/types/inquiries";
import { sendInquiryResponseEmail } from "@/email";

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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const data = respondToInquirySchema.parse(payload);

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    const responder =
      session.user.name || session.user.email || "Zigma Institute Team";

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        response: data.response,
        status: "resolved",
        respondedAt: new Date(),
        assignedTo: responder,
      },
    });

    try {
      await sendInquiryResponseEmail({
        to: inquiry.email,
        name: inquiry.name,
        subject: inquiry.subject,
        response: data.response,
      });
    } catch (emailError) {
      console.error("Failed to send inquiry response email", emailError);
    }

    return NextResponse.json(convertToPlainObject(serializeInquiry(updated)));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to respond to inquiry", error);
    return NextResponse.json(
      { error: "Unable to send response at this time." },
      { status: 500 }
    );
  }
}
