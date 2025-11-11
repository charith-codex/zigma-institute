import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { stripe } from "@/lib/stripe";

const registrationRequestSchema = z.object({
  name: z.string().min(2),
  dateOfBirth: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().max(200).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  guardianEmail: z.string().email(),
  courses: z.array(z.string().min(1)).min(1),
  studentPhoto: z.object({ url: z.string().url(), key: z.string().min(1) }),
});

const SUCCESS_PATH = "/student-registration/success";
const CANCEL_PATH = "/student-registration";
const INSTITUTE_NAME = "Zigma Institute";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured." },
      { status: 500 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parseResult = registrationRequestSchema.safeParse(payload);
  if (!parseResult.success) {
    const message = parseResult.error.issues
      .map((issue) => issue.message)
      .join("\n");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const data = parseResult.data;

  const courses = await prisma.course.findMany({
    where: { id: { in: data.courses } },
    orderBy: { name: "asc" },
  });

  if (courses.length === 0) {
    return NextResponse.json(
      { error: "Selected courses could not be found." },
      { status: 404 }
    );
  }

  const missingCourses = data.courses.filter(
    (courseId) => !courses.some((course) => course.id === courseId)
  );

  if (missingCourses.length > 0) {
    return NextResponse.json(
      { error: "One or more selected courses are unavailable." },
      { status: 400 }
    );
  }

  const currency = courses[0]?.currency ?? "usd";
  const hasMixedCurrencies = courses.some(
    (course) => course.currency.toLowerCase() !== currency.toLowerCase()
  );

  if (hasMixedCurrencies) {
    return NextResponse.json(
      { error: "All selected courses must share the same currency." },
      { status: 400 }
    );
  }

  const totalAmountInCents = courses.reduce(
    (sum, course) => sum + (course.priceInCents ?? 0),
    0
  );

  if (totalAmountInCents <= 0) {
    return NextResponse.json(
      { error: "Selected courses are not configured with a price." },
      { status: 400 }
    );
  }

  const dob = new Date(data.dateOfBirth);

  const registration = await prisma.studentRegistration.create({
    data: {
      name: data.name.trim(),
      email: data.email,
      phone: data.phone,
      address: data.address?.trim() ? data.address.trim() : null,
      gender: data.gender ?? null,
      dateOfBirth: dob,
      guardianEmail: data.guardianEmail,
      studentPhotoUrl: data.studentPhoto.url,
      studentPhotoKey: data.studentPhoto.key,
      totalAmountInCents,
      currency,
    },
  });

  await prisma.studentRegistrationCourse.createMany({
    data: courses.map((course) => ({
      registrationId: registration.id,
      courseId: course.id,
    })),
  });

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL;

  if (!origin) {
    return NextResponse.json(
      { error: "Unable to determine application URL for checkout." },
      { status: 500 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      success_url: `${origin}${SUCCESS_PATH}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${CANCEL_PATH}?canceled=1`,
      metadata: {
        registrationId: registration.id,
        studentEmail: data.email,
      },
      line_items: courses.map((course) => ({
        quantity: 1,
        price_data: {
          currency: course.currency,
          unit_amount: course.priceInCents,
          product_data: {
            name: course.name,
            description: `${INSTITUTE_NAME} course enrolment`,
          },
        },
      })),
    });

    if (!session.url || !session.id) {
      throw new Error("Stripe session missing required details");
    }

    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);
    await prisma.studentRegistration.delete({ where: { id: registration.id } });
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 }
    );
  }
}
