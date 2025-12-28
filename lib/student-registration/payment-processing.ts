import Stripe from "stripe";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { generateRandomPassword } from "@/lib/student-registration/password";
import { generateStudentPublicId } from "@/lib/student-registration/identifiers";
import { generateAndStoreStudentQrCode } from "@/lib/student-registration/qr-code";
import { generateAndUploadIdCard } from "@/lib/student-registration/generate-id-card";
import { sendStudentOnboardingEmail } from "@/email";

export async function processCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ success: boolean; error?: string }> {
  console.log("=== Processing Checkout Session ===");
  console.log("Session ID:", session.id);

  const registrationId = session.metadata?.registrationId;
  if (!registrationId) {
    console.warn("Missing registrationId in metadata");
    return { success: false, error: "Missing registrationId" };
  }

  const registration = await prisma.studentRegistration.findUnique({
    where: { id: registrationId },
    include: { courses: { include: { course: true } } },
  });

  if (!registration) {
    console.warn("Registration not found:", registrationId);
    return { success: false, error: "Registration not found" };
  }

  if (registration.status === "PAID" || registration.status === "APPROVED") {
    console.info("Registration already processed:", registrationId);
    return { success: true };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: registration.email },
  });

  if (existingUser) {
    // If user exists, we might want to just enroll them in the new courses?
    // For now, mirroring existing logic: fail or mark as failed.
    // However, if it's a retry, we should check if they were already created by US.
    // If status is not PAID, but user exists, it's a conflict.
    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: { status: "FAILED" },
    });
    console.error("User already exists:", registration.email);
    return { success: false, error: "User already exists" };
  }

  try {
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

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        for (const regCourse of registration.courses) {
          if (regCourse.courseId) {
            await tx.enrollment.create({
              data: { studentId: user.id, courseId: regCourse.courseId },
            });

            const course = regCourse.course;
            const coursePrice = course?.priceInCents ?? 0;

            await tx.paymentTransaction.create({
              data: {
                studentId: user.id,
                courseId: regCourse.courseId,
                amountInCents: coursePrice,
                currency: registration.currency,
                paidMonth: currentMonth,
                paidYear: currentYear,
                transactionId: `stripe_${session.id}_${regCourse.courseId}`,
                paidAt: now,
              },
            });
          }
        }

        return { studentUserId: user.id, studentPublicId: newPublicId };
      }
    );

    // Non-transactional side effects
    const qrResult = await generateAndStoreStudentQrCode(registration.id);
    const idCardResult = await generateAndUploadIdCard(registration.id);

    // Send email
    const courses = registration.courses
      .map((c) => c.course?.name)
      .filter((n): n is string => Boolean(n));

    await sendStudentOnboardingEmail({
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      studentName: registration.name,
      temporaryPassword: plainPassword,
      idCardUrl: idCardResult.success ? (idCardResult.idCardUrl ?? "") : "",
      courses,
    });

    console.log(`Student ${registration.email} onboarded successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error processing registration:", error);
    return { success: false, error: "Internal processing error" };
  }
}
