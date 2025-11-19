import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/db/prisma";
import { stripe } from "@/lib/stripe";
import { processPaidRegistration } from "@/lib/student-registration/process-registration";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

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
  });

  if (!registration) {
    console.warn("Registration not found:", registrationId);
    return;
  }

  if (registration.status !== "PENDING") {
    console.info("Registration already processed:", registrationId);
    return;
  }

  await processPaidRegistration(registrationId);

  console.log(`Student ${registration.email} onboarded successfully`);
}
