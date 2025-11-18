import { UTApi } from "uploadthing/server";
import { prisma } from "@/db/prisma";
import {
  prepareStudentIdCardAssets,
  renderStudentIdCardSvg,
} from "./id-card";

const INSTITUTE_INFO = {
  name: "Zigma Institute",
  tagline: "AI-powered personalised learning for ambitious students.",
  address: "Colombo Innovation Hub, 512 Galle Road, Colombo 03",
};

interface GenerateIdCardResult {
  success: boolean;
  idCardUrl?: string;
  idCardKey?: string;
  error?: string;
}

/**
 * Generates and uploads a student ID card for a registration
 * Can be called from webhook after payment or when staff approves
 */
export async function generateAndUploadIdCard(
  registrationId: string
): Promise<GenerateIdCardResult> {
  try {
    // Fetch registration with courses
    const registration = await prisma.studentRegistration.findUnique({
      where: { id: registrationId },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (!registration.studentPublicId) {
      return { success: false, error: "Student ID not assigned yet" };
    }

    // Prepare card data
    const cardData = {
      studentName: registration.name,
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      courses: registration.courses
        .map((c) => c.course?.name)
        .filter((n): n is string => Boolean(n)),
      instituteName: INSTITUTE_INFO.name,
      instituteTagline: INSTITUTE_INFO.tagline,
      instituteAddress: INSTITUTE_INFO.address,
      studentPhotoUrl: registration.studentPhotoUrl,
    };

    // Generate ID card
    const assets = await prepareStudentIdCardAssets(cardData);
    const svg = renderStudentIdCardSvg(cardData, assets);

    // Create file for upload
    const file = new File([svg], `${registration.studentPublicId}-id-card.svg`, {
      type: "image/svg+xml",
    });

    // Upload to UploadThing
    const utapi = new UTApi();
    const uploadResponse = await utapi.uploadFiles(file);
    const uploaded = Array.isArray(uploadResponse)
      ? uploadResponse[0]
      : uploadResponse;

    if (!uploaded?.data?.url || !uploaded?.data?.key) {
      console.error("UploadThing response:", uploadResponse);
      return { success: false, error: "Failed to upload ID card to UploadThing" };
    }

    // Update registration record
    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: {
        idCardUrl: uploaded.data.url,
        idCardKey: uploaded.data.key,
      },
    });

    // Update student record if exists
    if (registration.studentUserId) {
      await prisma.student.update({
        where: { userId: registration.studentUserId },
        data: {
          idCardUrl: uploaded.data.url,
          idCardKey: uploaded.data.key,
        },
      });
    }

    console.log(
      `ID card generated and uploaded successfully for ${registration.studentPublicId}`
    );

    return {
      success: true,
      idCardUrl: uploaded.data.url,
      idCardKey: uploaded.data.key,
    };
  } catch (error) {
    console.error("Failed to generate/upload ID card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
