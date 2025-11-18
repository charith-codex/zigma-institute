import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { hashSync } from "bcrypt-ts-edge";
import { UTApi } from "uploadthing/server";

import { prisma } from "@/db/prisma";
import { stripe } from "@/lib/stripe";
import { generateRandomPassword } from "@/lib/student-registration/password";
import { generateStudentPublicId } from "@/lib/student-registration/identifiers";
import {
  prepareStudentIdCardAssets,
  renderStudentIdCardSvg,
} from "@/lib/student-registration/id-card";
import { sendStudentOnboardingEmail } from "@/email";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const INSTITUTE_INFO = {
  name: "Zigma Institute",
  tagline: "AI-powered personalised learning for ambitious students.",
  address: "Colombo Innovation Hub, 512 Galle Road, Colombo 03",
};

// Webhook handler
export async function POST(req: NextRequest) {
  if (!stripe || !WEBHOOK_SECRET) {
    console.error("Stripe not configured properly");
    return NextResponse.json(
      { error: "Webhook misconfigured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      return NextResponse.json({
        message: "Student registration processed successfully",
      });
    }

    return NextResponse.json({
      message: `Unhandled event type: ${event.type}`,
    });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const registrationId = session.metadata?.registrationId;
  if (!registrationId) {
    console.warn("Missing registrationId in metadata");
    return;
  }

  const registration = await prisma.studentRegistration.findUnique({
    where: { id: registrationId },
    include: { courses: { include: { course: true } } },
  });

  if (!registration) {
    console.warn("Registration not found:", registrationId);
    return;
  }

  if (registration.status !== "PENDING") {
    console.info("Registration already processed:", registrationId);
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: registration.email },
  });

  if (existingUser) {
    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: { status: "FAILED" },
    });
    console.error("User already exists:", registration.email);
    return;
  }

  // Generate credentials and create records
  const plainPassword = generateRandomPassword();
  const hashedPassword = hashSync(plainPassword, 10);

  const { studentUserId, studentPublicId } = await prisma.$transaction(
    async (tx) => {
      const newPublicId = await generateStudentPublicId(tx);

      const user = await tx.user.create({
        data: {
          name: registration.name,
          email: registration.email,
          password: hashedPassword,
          phone: registration.phone,
          dob: registration.dateOfBirth,
          address: registration.address ?? undefined,
          gender: registration.gender ?? undefined,
          role: "STUDENT",
          profileImage: registration.studentPhotoUrl,
        },
      });

      await tx.student.create({
        data: {
          userId: user.id,
          studentPublicId: newPublicId,
          parentEmail: registration.guardianEmail,
        },
      });

      await tx.studentRegistration.update({
        where: { id: registration.id },
        data: {
          status: "PAID",
          studentUserId: user.id,
          studentPublicId: newPublicId,
        },
      });

      for (const regCourse of registration.courses) {
        if (regCourse.courseId) {
          await tx.enrollment.create({
            data: { studentId: user.id, courseId: regCourse.courseId },
          });
        }
      }

      return { studentUserId: user.id, studentPublicId: newPublicId };
    }
  );

  // Generate student ID card
  const cardData = {
    studentName: registration.name,
    studentPublicId,
    studentEmail: registration.email,
    guardianEmail: registration.guardianEmail,
    courses: registration.courses
      .map((c) => c.course?.name)
      .filter((n): n is string => Boolean(n)),
    instituteName: INSTITUTE_INFO.name,
    instituteTagline: INSTITUTE_INFO.tagline,
    instituteAddress: INSTITUTE_INFO.address,
    studentPhotoUrl: registration.studentPhotoUrl,
  };

  const assets = await prepareStudentIdCardAssets(cardData);
  const svg = renderStudentIdCardSvg(cardData, assets);

   // Create file for upload
  const file = new File(
    [svg],
    `${studentPublicId}-id-card.svg`,
    {
      type: "image/svg+xml",
    }
  );

  const utapi = new UTApi();
  const uploadResponse = await utapi.uploadFiles(file);
  const uploaded = Array.isArray(uploadResponse)
    ? uploadResponse[0]
    : uploadResponse;

  if (!uploaded?.data?.url || !uploaded?.data?.key) {
    console.error("UploadThing response:", uploadResponse);
    throw new Error("Failed to upload ID card to UploadThing");
  }

  await prisma.student.update({
    where: { userId: studentUserId },
    data: {
      idCardUrl: uploaded.data.url,
      idCardKey: uploaded.data.key,
    },
  });

  await prisma.studentRegistration.update({
    where: { id: registration.id },
    data: {
      idCardUrl: uploaded.data.url,
      idCardKey: uploaded.data.key,
    },
  });

  // Send onboarding email
  await sendStudentOnboardingEmail({
    studentEmail: registration.email,
    guardianEmail: registration.guardianEmail,
    studentName: registration.name,
    temporaryPassword: plainPassword,
    idCardUrl: uploaded.data.url,
    courses: cardData.courses,
  });

  console.log(`Student ${registration.email} onboarded successfully`);
}
