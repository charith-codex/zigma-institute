import { hashSync } from "bcrypt-ts-edge";

import { prisma } from "@/db/prisma";
import { generateRandomPassword } from "@/lib/student-registration/password";
import { generateStudentPublicId } from "@/lib/student-registration/identifiers";
import { generateAndUploadIdCard } from "@/lib/student-registration/generate-id-card";
import { sendStudentOnboardingEmail } from "@/email";

interface ProcessResult {
  studentUserId: string;
  studentPublicId: string;
}

export async function processPaidRegistration(
  registrationId: string
): Promise<ProcessResult | null> {
  const registration = await prisma.studentRegistration.findUnique({
    where: { id: registrationId },
    include: { courses: { include: { course: true } } },
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  if (registration.status !== "PENDING") {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: registration.email },
  });

  if (existingUser) {
    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: { status: "FAILED" },
    });
    throw new Error("User already exists");
  }

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

  const idCardResult = await generateAndUploadIdCard(registration.id);

  if (!idCardResult.success) {
    console.error(`Failed to generate ID card: ${idCardResult.error}`);
  }

  const courses = registration.courses
    .map((c) => c.course?.name)
    .filter((name): name is string => Boolean(name));

  try {
    await sendStudentOnboardingEmail({
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      studentName: registration.name,
      temporaryPassword: plainPassword,
      idCardUrl: idCardResult.idCardUrl || "",
      courses,
    });
  } catch (error) {
    console.error("Failed to send onboarding email", error);
  }

  return { studentUserId, studentPublicId };
}
