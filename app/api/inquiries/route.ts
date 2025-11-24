import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import {
  createInquirySchema,
  inquiryStatusOptions,
  inquiryTypeOptions,
} from "@/lib/validators/inquiries";
import type { InquiryRecord } from "@/types/inquiries";

const serializeInquiry = (inquiry: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: (typeof inquiryTypeOptions)[number];
  status: (typeof inquiryStatusOptions)[number];
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
  inquiryType: inquiry.inquiryType,
  status: inquiry.status,
  response: inquiry.response,
  respondedAt: inquiry.respondedAt?.toISOString() ?? null,
  assignedTo: inquiry.assignedTo,
  submittedAt: inquiry.createdAt.toISOString(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(convertToPlainObject(inquiries.map(serializeInquiry)));
  } catch (error) {
    console.error("Failed to load inquiries", error);
    return NextResponse.json(
      { error: "Unable to load inquiries. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = createInquirySchema.parse(payload);

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        inquiryType: data.inquiryType,
      },
    });

    return NextResponse.json(serializeInquiry(inquiry), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join("\n") },
        { status: 400 }
      );
    }

    console.error("Failed to submit inquiry", error);
    return NextResponse.json(
      { error: "Unable to send your inquiry right now. Please try again." },
      { status: 500 }
    );
  }
}
