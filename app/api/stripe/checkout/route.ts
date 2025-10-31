import { NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { stripe } from "@/lib/stripe";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured." },
      { status: 500 }
    );
  }

  if (!publishableKey) {
    return NextResponse.json(
      { error: "Stripe publishable key is not configured." },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || !("courseId" in body)) {
    return NextResponse.json(
      { error: "A courseId is required." },
      { status: 400 }
    );
  }

  const { courseId } = body as { courseId?: unknown };

  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    return NextResponse.json(
      { error: "A courseId is required." },
      { status: 400 }
    );
  }

  const normalizedCourseId = courseId.trim();

  const course = await prisma.course.findUnique({
    where: { id: normalizedCourseId },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  if (!course.priceInCents || course.priceInCents <= 0) {
    return NextResponse.json(
      { error: "Course is not configured with a valid price." },
      { status: 400 }
    );
  }

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
      payment_method_types: ["card"],
      success_url: `${origin}/lms/courses/${course.slug}?success=true`,
      cancel_url: `${origin}/lms/courses/${course.slug}?canceled=true`,
      line_items: [
        {
          price_data: {
            currency: course.currency,
            product_data: {
              name: course.name,
              description: course.description,
            },
            unit_amount: course.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course.id,
      },
    });

    if (!session.url) {
      throw new Error("Stripe session did not return a URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 }
    );
  }
}
