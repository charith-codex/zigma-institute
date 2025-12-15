import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { calculateDiscountRate, deriveMonthlyAmount } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

interface PaymentSessionResponse {
  url: string;
}

interface PaymentVerificationResponse {
  paid: boolean;
  courseId: string | null;
  planId: string | null;
  amountPaidInCents: number | null;
  currency: string | null;
  transactionId: string | null;
}

const resolveOrigin = (request: Request) =>
  request.headers.get("origin") ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.NEXTAUTH_URL;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Only students can initiate payments." },
      { status: 403 }
    );
  }

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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { courseId, planId } = body as { courseId?: unknown; planId?: unknown };

  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  }

  const normalizedCourseId = courseId.trim();

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: session.user.id, courseId: normalizedCourseId },
    include: { course: true },
  });

  const course =
    enrollment?.course ??
    (await prisma.course.findUnique({
      where: { id: normalizedCourseId },
    }));

  if (!course) {
    return NextResponse.json(
      { error: "Selected course could not be found." },
      { status: 404 }
    );
  }

  const alreadyEnrolled = Boolean(enrollment);

  if (!course.priceInCents || course.priceInCents <= 0) {
    return NextResponse.json(
      { error: "Course does not have a valid price configured." },
      { status: 400 }
    );
  }

  const courseCount = await prisma.enrollment.count({
    where: { studentId: session.user.id },
  });

  const discountRate = calculateDiscountRate(
    alreadyEnrolled ? courseCount : courseCount + 1
  );
  const baseMonthlyAmount = deriveMonthlyAmount(course.priceInCents);
  const amountInCents = Math.round(baseMonthlyAmount * (1 - discountRate));

  if (amountInCents <= 0) {
    return NextResponse.json(
      { error: "Course price is not set for billing." },
      { status: 400 }
    );
  }

  const origin = resolveOrigin(request);

  if (!origin) {
    return NextResponse.json(
      { error: "Unable to determine application URL for checkout." },
      { status: 500 }
    );
  }

  try {
    const sessionPayload = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/lms?payment=success&courseId=${course.id}&planId=${encodeURIComponent(
        typeof planId === "string" && planId.trim().length > 0
          ? planId
          : course.id
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/lms?payment=cancelled`,
      line_items: [
        {
          price_data: {
            currency: course.currency,
            product_data: {
              name: `${course.name} monthly installment`,
              description: course.description,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course.id,
        studentId: session.user.id,
        planId:
          typeof planId === "string" && planId.trim().length > 0
            ? planId
            : course.id,
        baseMonthlyAmount: baseMonthlyAmount.toString(),
        discountRate: discountRate.toString(),
        enrollOnSuccess: alreadyEnrolled ? "false" : "true",
      },
    });

    if (!sessionPayload.url) {
      throw new Error("Stripe session did not return a URL.");
    }

    const response: PaymentSessionResponse = { url: sessionPayload.url };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Stripe payment checkout error", error);
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      checkoutSession.metadata?.studentId &&
      checkoutSession.metadata.studentId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "This payment session does not belong to you." },
        { status: 403 }
      );
    }

    const courseId = checkoutSession.metadata?.courseId ?? null;
    const enrollOnSuccess = checkoutSession.metadata?.enrollOnSuccess === "true";
    const discountRate = Number(checkoutSession.metadata?.discountRate ?? 0);
    const estimatedBase = Number(
      checkoutSession.metadata?.baseMonthlyAmount ?? 0
    );

    const course = courseId
      ? await prisma.course.findUnique({
          where: { id: courseId },
        })
      : null;

    const transactionId =
      typeof checkoutSession.payment_intent === "string"
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id ?? checkoutSession.id;

    const amountInCents =
      checkoutSession.amount_total ??
      (estimatedBase > 0
        ? Math.max(
            Math.round(estimatedBase * (1 - discountRate)),
            estimatedBase
          )
        : null);

    if (checkoutSession.payment_status === "paid" && amountInCents && courseId) {
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: session.user.id, courseId },
        },
        include: { course: true },
      });

      if (!existingEnrollment && enrollOnSuccess) {
        if (!course) {
          return NextResponse.json(
            { error: "Course not found for enrollment." },
            { status: 404 }
          );
        }

        await prisma.enrollment.create({
          data: { studentId: session.user.id, courseId },
        });
      } else if (!existingEnrollment && !enrollOnSuccess) {
        return NextResponse.json(
          { error: "Enrollment not found for this payment." },
          { status: 404 }
        );
      }

      const paidAt = checkoutSession.created
        ? new Date(checkoutSession.created * 1000)
        : new Date();

      const previousInstallments = await prisma.paymentTransaction.count({
        where: {
          studentId: session.user.id,
          courseId,
          paymentType: "INSTALLMENT",
        },
      });

      const monthNumber = previousInstallments + 1;

      await prisma.paymentTransaction.upsert({
        where: { transactionId },
        update: {
          amountInCents,
          currency:
            checkoutSession.currency ??
            existingEnrollment?.course?.currency ??
            course?.currency ??
            "usd",
          monthNumber,
          discountRate,
          paidAt,
        },
        create: {
          transactionId,
          studentId: session.user.id,
          courseId,
          amountInCents,
          currency:
            checkoutSession.currency ??
            existingEnrollment?.course?.currency ??
            course?.currency ??
            "usd",
          paymentType: "INSTALLMENT",
          monthNumber,
          discountRate,
          paidAt,
        },
      });
    }

    const response: PaymentVerificationResponse = {
      paid: checkoutSession.payment_status === "paid",
      courseId: checkoutSession.metadata?.courseId ?? null,
      planId: checkoutSession.metadata?.planId ?? null,
      amountPaidInCents: checkoutSession.amount_total ?? null,
      currency: checkoutSession.currency ?? null,
      transactionId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id ?? checkoutSession.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Stripe payment verification error", error);
    return NextResponse.json(
      { error: "Unable to verify payment session." },
      { status: 500 }
    );
  }
}
