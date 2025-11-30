import { prisma } from "@/db/prisma";
import QRCode from "qrcode";

export interface StudentQrPayload {
  type: "ZIGMA_STUDENT_ID";
  studentPublicId: string;
  studentName: string;
  studentEmail: string;
  registrationId: string;
}

export interface GenerateStudentQrResult {
  success: boolean;
  qrCodeUrl?: string;
  error?: string;
}

function buildStudentQrPayload(data: StudentQrPayload): string {
  return JSON.stringify(data);
}

export async function generateAndStoreStudentQrCode(
  registrationId: string
): Promise<GenerateStudentQrResult> {
  try {
    const registration = await prisma.studentRegistration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        name: true,
        email: true,
        studentPublicId: true,
        studentUserId: true,
      },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (!registration.studentPublicId) {
      return { success: false, error: "Student ID not assigned yet" };
    }

    const payload: StudentQrPayload = {
      type: "ZIGMA_STUDENT_ID",
      studentPublicId: registration.studentPublicId,
      studentName: registration.name,
      studentEmail: registration.email,
      registrationId: registration.id,
    };

    const qrCodeUrl = await QRCode.toDataURL(buildStudentQrPayload(payload), {
      width: 320,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
      type: "image/png",
    });

    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: { qrCodeUrl },
    });

    if (registration.studentUserId) {
      await prisma.student.update({
        where: { userId: registration.studentUserId },
        data: { qrCodeUrl },
      });
    }

    return { success: true, qrCodeUrl };
  } catch (error) {
    console.error("Failed to generate student QR code", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
