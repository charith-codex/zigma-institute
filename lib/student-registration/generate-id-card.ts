import { Buffer } from "node:buffer";

import { prisma } from "@/db/prisma";

const INSTITUTE_INFO = {
  name: "Zigma Institute",
  tagline: "AI-powered personalised learning for ambitious students.",
};

interface GenerateIdCardResult {
  success: boolean;
  idCardUrl?: string;
  error?: string;
}

interface SimpleIdCardData {
  studentName: string;
  studentPublicId: string;
  studentEmail: string;
  guardianEmail: string;
  studentPhotoUrl: string | null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .padEnd(2, "•");
}

function buildSimpleIdCardSvg(data: SimpleIdCardData): string {
  const issuedOn = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const initials = getInitials(data.studentName);
  const safeName = escapeXml(data.studentName);
  const safePublicId = escapeXml(data.studentPublicId);
  const safeStudentEmail = escapeXml(data.studentEmail);
  const safeGuardianEmail = escapeXml(data.guardianEmail);
  const safePhoto = data.studentPhotoUrl
    ? escapeXml(data.studentPhotoUrl)
    : null;
  const clipId = `photoClip-${
    data.studentPublicId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "default"
  }`;

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="960" height="560" viewBox="0 0 960 560" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect width="960" height="560" rx="32" fill="url(#cardGradient)" />
    <rect x="24" y="24" width="912" height="512" rx="24" fill="#0b1220" opacity="0.35" />
    <text x="60" y="100" font-size="42" font-weight="600" fill="#f8fafc">${INSTITUTE_INFO.name}</text>
    <text x="60" y="140" font-size="22" fill="#cbd5f5">${INSTITUTE_INFO.tagline}</text>
    <text x="60" y="220" font-size="32" font-weight="600" fill="#f1f5f9">${safeName}</text>
    <text x="60" y="260" font-size="18" fill="#cbd5f5">Student ID • ${safePublicId}</text>
    <text x="60" y="300" font-size="18" fill="#94a3b8">Email • ${safeStudentEmail}</text>
    <text x="60" y="340" font-size="18" fill="#94a3b8">Guardian • ${safeGuardianEmail}</text>
    <text x="60" y="400" font-size="16" fill="#cbd5f5">Issued ${issuedOn}</text>
    <g transform="translate(640, 120)">
      <rect width="240" height="320" rx="32" fill="#0f172a" opacity="0.9" />
      <rect x="20" y="20" width="200" height="200" rx="24" fill="#fff" opacity="0.1" />
      <clipPath id="${clipId}">
        <rect x="20" y="20" width="200" height="200" rx="24" />
      </clipPath>
      ${
        safePhoto
          ? `<image x="20" y="20" width="200" height="200" preserveAspectRatio="xMidYMid slice" href="${safePhoto}" clip-path="url(#${clipId})" />`
          : `<text x="120" y="140" text-anchor="middle" font-size="72" font-weight="700" fill="#1d4ed8" opacity="0.6">${initials}</text>`
      }
      <foreignObject x="10" y="230" width="220" height="80">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;flex-direction:column;align-items:center;gap:4px;color:#e2e8f0;font-family:'Inter',sans-serif;">
          <strong style="font-size:16px">${safeName}</strong>
        </div>
      </foreignObject>
    </g>
  </svg>`;
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
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    if (!registration.studentPublicId) {
      return { success: false, error: "Student ID not assigned yet" };
    }

    const cardData: SimpleIdCardData = {
      studentName: registration.name,
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      studentPhotoUrl: registration.studentPhotoUrl ?? null,
    };

    const svg = buildSimpleIdCardSvg(cardData);
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: {
        idCardUrl: dataUrl,
        idCardKey: null,
      },
    });

    if (registration.studentUserId) {
      await prisma.student.update({
        where: { userId: registration.studentUserId },
        data: {
          idCardUrl: dataUrl,
          idCardKey: null,
        },
      });
    }

    console.log(
      `ID card generated successfully for ${registration.studentPublicId}`
    );

    return {
      success: true,
      idCardUrl: dataUrl,
    };
  } catch (error) {
    console.error("Failed to generate/upload ID card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
