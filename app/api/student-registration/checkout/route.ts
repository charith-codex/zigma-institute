import { NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { stripe } from "@/lib/stripe";
import { SERVER_URL } from "@/lib/constants";
import { studentRegistrationCheckoutSchema } from "@/lib/student-registration/schema";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe configuration is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = studentRegistrationCheckoutSchema.parse(body);

    const priceId = process.env.STRIPE_STUDENT_REGISTRATION_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Registration price is not configured" },
        { status: 500 }
      );
    }

    const pending = await prisma.pendingStudentRegistration.create({
      data: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email.toLowerCase(),
        phone: parsed.phone,
        address: parsed.address,
        parentEmail: parsed.parentEmail ?? null,
        dob: parsed.dob ? new Date(parsed.dob) : null,
        profileImageData: parsed.profileImage.data,
        profileImageMimeType: parsed.profileImage.mimeType,
        notes: parsed.notes ?? null,
        status: "PENDING_PAYMENT",
        source: "ONLINE",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        pendingRegistrationId: pending.id,
      },
      success_url: `${SERVER_URL}/student-registration/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SERVER_URL}/student-registration/cancelled`,
    });

    await prisma.pendingStudentRegistration.update({
      where: { id: pending.id },
      data: {
        stripeSessionId: session.id,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : null,
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid registration details" },
        { status: 400 }
      );
    }

    console.error("Failed to create registration checkout session", error);
    return NextResponse.json(
      { error: "Unable to start the registration checkout" },
      { status: 500 }
    );
  }
}
