import { Resend } from "resend";
import { UTApi } from "uploadthing/server";
import { hashSync } from "bcrypt-ts-edge";

import { prisma } from "@/db/prisma";
import { APP_NAME, SENDER_EMAIL } from "@/lib/constants";
import StudentRegistrationWelcome from "@/email/student-registration-welcome";
import {
  createStudentIdCardPdf,
  generateRandomPassword,
  generateStudentPublicId,
  resolveProfileImageBuffer,
  type PendingProfileImageSource,
} from "./utils";

const resendClient = new Resend(process.env.RESEND_API_KEY ?? "");
const utapi = new UTApi();

function hasResendCredentials() {
  return Boolean(process.env.RESEND_API_KEY);
}

type ProcessRegistrationOptions = {
  sendEmail?: boolean;
};

type ProcessRegistrationResult = {
  studentId: string;
  email: string;
  password: string | null;
  idCardUrl: string;
};

const PROCESSABLE_STATUSES = new Set([
  "PENDING_PAYMENT",
  "AWAITING_APPROVAL",
  "PROCESSING",
]);

export async function processPendingRegistration(
  registrationId: string,
  options: ProcessRegistrationOptions = {}
): Promise<ProcessRegistrationResult> {
  const { sendEmail = true } = options;

  const pendingSnapshot = await prisma.pendingStudentRegistration.findUnique({
    where: { id: registrationId },
    include: { student: true },
  });

  if (!pendingSnapshot) {
    throw new Error("Pending registration not found");
  }

  if (
    pendingSnapshot.status === "COMPLETED" &&
    pendingSnapshot.student?.studentPublicId &&
    pendingSnapshot.student.idCardUrl
  ) {
    return {
      studentId: pendingSnapshot.student.studentPublicId,
      email: pendingSnapshot.email,
      password: null,
      idCardUrl: pendingSnapshot.student.idCardUrl,
    };
  }

  if (!PROCESSABLE_STATUSES.has(pendingSnapshot.status)) {
    throw new Error(
      `Registration cannot be processed while in the ${pendingSnapshot.status} state`
    );
  }

  const plainPassword = generateRandomPassword();
  const hashedPassword = hashSync(plainPassword, 10);

  let transactionResult: {
    pending: typeof pendingSnapshot;
    user: any;
    student: any;
  };

  try {
    transactionResult = await prisma.$transaction(async (tx) => {
      const pending = await tx.pendingStudentRegistration.update({
        where: { id: registrationId },
        data: {
          status: "PROCESSING",
          failureReason: null,
        },
      });

      let user = await tx.user.findUnique({
        where: { email: pending.email },
        include: { student: true },
      });

      const userData = {
        name: `${pending.firstName} ${pending.lastName}`.trim(),
        phone: pending.phone,
        address: pending.address ?? null,
        dob: pending.dob ?? null,
        profileImage: pending.profileImageUrl ?? user?.profileImage ?? null,
        password: hashedPassword,
        role: "STUDENT" as const,
      };

      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: userData,
          include: { student: true },
        });
      } else {
        user = await tx.user.create({
          data: {
            ...userData,
            email: pending.email,
          },
          include: { student: true },
        });
      }

      let student = user.student;

      if (!student || !student.studentPublicId) {
        const studentPublicId = await generateStudentPublicId(tx);

        student = await tx.student.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            parentEmail: pending.parentEmail,
            studentPublicId,
          },
          update: {
            parentEmail: pending.parentEmail,
            studentPublicId,
          },
        });
      } else if (
        pending.parentEmail &&
        pending.parentEmail !== student.parentEmail
      ) {
        student = await tx.student.update({
          where: { userId: user.id },
          data: {
            parentEmail: pending.parentEmail,
          },
        });
      }

      return {
        pending,
        user,
        student,
      };
    });
  } catch (error) {
    await prisma.pendingStudentRegistration
      .update({
        where: { id: registrationId },
        data: {
          status: "FAILED",
          failureReason:
            error instanceof Error ? error.message : "Processing failed",
        },
      })
      .catch(() => undefined);

    throw error;
  }

  const { pending, user, student } = transactionResult;

  const profileSource: PendingProfileImageSource = {
    base64: pending.profileImageData,
    url: pending.profileImageUrl ?? user.profileImage ?? undefined,
    mimeType: pending.profileImageMimeType,
  };

  try {
    const { buffer: profileBuffer } = await resolveProfileImageBuffer(
      profileSource
    );

    let uploadedPhoto: { url: string; key: string | null } | null = null;

    if (!pending.profileImageUrl && pending.profileImageData) {
      const photoFile = new File(
        [profileBuffer],
        `${student.studentPublicId}-photo.jpg`,
        { type: "image/jpeg" }
      );

      const uploadResponse = await utapi.uploadFiles(photoFile);
      const uploadData = Array.isArray(uploadResponse)
        ? uploadResponse[0]?.data
        : uploadResponse.data;

      if (!uploadData?.url) {
        throw new Error("Unable to store the student profile photo");
      }

      uploadedPhoto = {
        url: uploadData.url,
        key: uploadData.key ?? null,
      };
    }

    const cardBuffer = await createStudentIdCardPdf({
      studentName: user.name ?? `${pending.firstName} ${pending.lastName}`,
      studentId: student.studentPublicId,
      studentEmail: user.email,
      studentPhone: user.phone ?? pending.phone,
      instituteName: APP_NAME,
      studentPhoto: profileBuffer,
      profileImageMimeType: pending.profileImageMimeType,
    });

    const cardFile = new File(
      [cardBuffer],
      `${student.studentPublicId}.pdf`,
      {
        type: "application/pdf",
      }
    );

    const cardUploadResponse = await utapi.uploadFiles(cardFile);
    const cardUploadData = Array.isArray(cardUploadResponse)
      ? cardUploadResponse[0]?.data
      : cardUploadResponse.data;

    if (!cardUploadData?.url) {
      throw new Error("Failed to upload the generated ID card");
    }

    const profileImageUrl =
      uploadedPhoto?.url ?? pending.profileImageUrl ?? user.profileImage ?? null;
    const profileImageKey =
      uploadedPhoto?.key ?? pending.profileImageFileKey ?? null;

    await prisma.$transaction([
      prisma.student.update({
        where: { userId: student.userId },
        data: {
          idCardUrl: cardUploadData.url,
          idCardFileKey: cardUploadData.key ?? null,
          idCardGeneratedAt: new Date(),
          profileImageFileKey: profileImageKey,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          profileImage: profileImageUrl,
        },
      }),
      prisma.pendingStudentRegistration.update({
        where: { id: pending.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          studentId: student.userId,
          profileImageUrl: profileImageUrl,
          profileImageFileKey: profileImageKey,
          failureReason: null,
        },
      }),
    ]);

    if (sendEmail && hasResendCredentials()) {
      try {
        await resendClient.emails.send({
          from: `${APP_NAME} <${SENDER_EMAIL}>`,
          to: pending.email,
          subject: `Your ${APP_NAME} LMS access`,
          react: (
            <StudentRegistrationWelcome
              studentName={user.name ?? pending.firstName}
              studentId={student.studentPublicId}
              loginEmail={pending.email}
              password={plainPassword}
            />
          ),
          attachments: [
            {
              filename: `${student.studentPublicId}.pdf`,
              content: cardBuffer.toString("base64"),
            },
          ],
        });
      } catch (emailError) {
        console.error("Failed to send welcome email", emailError);
      }
    }

    return {
      studentId: student.studentPublicId,
      email: pending.email,
      password: plainPassword,
      idCardUrl: cardUploadData.url,
    };
  } catch (error) {
    await prisma.pendingStudentRegistration
      .update({
        where: { id: pending.id },
        data: {
          status: "FAILED",
          failureReason:
            error instanceof Error ? error.message : "Processing failed",
        },
      })
      .catch(() => undefined);

    throw error;
  }
}
