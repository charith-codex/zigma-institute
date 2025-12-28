import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { stripe } from "@/lib/stripe";
import { processCheckoutSession } from "@/lib/student-registration/payment-processing";

export async function POST(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: "Missing registrationId" },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const registration = await prisma.studentRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.status === "PAID" || registration.status === "APPROVED") {
      return NextResponse.json({
        message: "Already processed",
        status: registration.status,
      });
    }

    if (!registration.stripeSessionId) {
      return NextResponse.json(
        { error: "No Stripe session associated with this registration" },
        { status: 400 }
      );
    }

    // Fetch session from Stripe to verify payment
    const session = await stripe.checkout.sessions.retrieve(
      registration.stripeSessionId
    );

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed yet" },
        { status: 400 }
      );
    }

    // Process payment manually
    const result = await processCheckoutSession(session);

    if (result.success) {
      return NextResponse.json({ message: "Synced successfully" });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to process payment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
