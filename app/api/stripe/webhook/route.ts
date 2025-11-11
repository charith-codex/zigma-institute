import { headers } from "next/headers";
import { NextResponse } from "next/server";
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

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const INSTITUTE_NAME = "Zigma Institute";
const INSTITUTE_TAGLINE = "AI-powered personalised learning for ambitious students.";
const INSTITUTE_ADDRESS = "Colombo Innovation Hub, 512 Galle Road, Colombo 03";

export async function POST(request: Request) {
  if (!stripe || !WEBHOOK_SECRET) {
    console.error("Stripe webhook secret or client not configured");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler failed", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const registrationId = session.metadata?.registrationId;

  if (!registrationId) {
    console.warn("Checkout session completed without registration metadata");
    return;
  }

  const registration = await prisma.studentRegistration.findUnique({
    where: { id: registrationId },
    include: {
      courses: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!registration) {
    console.warn("Registration not found for webhook", registrationId);
    return;
  }

  if (registration.status !== "PENDING") {
    console.info("Registration already processed", registrationId);
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
    console.error("User already exists for registration", registration.email);
    return;
  }

  const plainPassword = generateRandomPassword();
  const hashedPassword = hashSync(plainPassword, 10);

  const { studentUserId, studentPublicId } = await prisma.$transaction(async (tx) => {
    const newStudentPublicId = await generateStudentPublicId(tx);

    const user = await tx.user.create({
      data: {
        name: `${registration.firstName} ${registration.lastName}`.trim(),
        email: registration.email,
        password: hashedPassword,
        phone: registration.phone,
        dob: registration.dateOfBirth,
        role: "STUDENT",
        profileImage: registration.studentPhotoUrl,
      },
    });

    await tx.student.create({
      data: {
        userId: user.id,
        studentPublicId: newStudentPublicId,
        parentEmail: registration.guardianEmail,
      },
    });

    await tx.studentRegistration.update({
      where: { id: registration.id },
      data: {
        status: "PAID",
        studentUserId: user.id,
        studentPublicId: newStudentPublicId,
      },
    });

    for (const registrationCourse of registration.courses) {
      if (!registrationCourse.courseId) continue;
      await tx.enrollment.create({
        data: {
          studentId: user.id,
          courseId: registrationCourse.courseId,
        },
      });
    }

    return { studentUserId: user.id, studentPublicId: newStudentPublicId };
  });

  const cardData = {
    studentName: `${registration.firstName} ${registration.lastName}`.trim(),
    studentPublicId,
    studentEmail: registration.email,
    guardianName: registration.guardianName,
    courses: registration.courses
      .map((course) => course.course?.name)
      .filter((name): name is string => Boolean(name)),
    instituteName: INSTITUTE_NAME,
    instituteTagline: INSTITUTE_TAGLINE,
    instituteAddress: INSTITUTE_ADDRESS,
    studentPhotoUrl: registration.studentPhotoUrl,
  };

  const assets = await prepareStudentIdCardAssets(cardData);
  const svg = renderStudentIdCardSvg(cardData, assets);

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const file = new File([blob], `${studentPublicId}-id-card.svg`, {
    type: "image/svg+xml",
  });

  const utapi = new UTApi();
  const uploadResponse = await utapi.uploadFiles(file);
  const uploadData = Array.isArray(uploadResponse)
    ? uploadResponse[0]
    : uploadResponse;

  if (!uploadData || !uploadData.data?.url || !uploadData.data?.key) {
    throw new Error("Failed to upload ID card to UploadThing");
  }

  await prisma.student.update({
    where: { userId: studentUserId },
    data: {
      idCardUrl: uploadData.data.url,
      idCardKey: uploadData.data.key,
    },
  });

  await prisma.studentRegistration.update({
    where: { id: registration.id },
    data: {
      idCardUrl: uploadData.data.url,
      idCardKey: uploadData.data.key,
    },
  });

  await sendStudentOnboardingEmail({
    studentEmail: registration.email,
    guardianEmail: registration.guardianEmail,
    studentName: `${registration.firstName} ${registration.lastName}`.trim(),
    guardianName: registration.guardianName,
    temporaryPassword: plainPassword,
    idCardUrl: uploadData.data.url,
    courses: cardData.courses,
  });
}
