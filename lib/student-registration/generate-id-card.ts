import { Buffer } from "node:buffer";

import { prisma } from "@/db/prisma";
import { generateAndStoreStudentQrCode } from "@/lib/student-registration/qr-code";

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
  qrCodeUrl: string | null;
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
  const safeQr = data.qrCodeUrl ? escapeXml(data.qrCodeUrl) : null;
  const clipId = `photoClip-${
    data.studentPublicId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "default"
  }`;

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="960" height="560" viewBox="0 0 960 560" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1a3a" />
        <stop offset="50%" stop-color="#0c2f66" />
        <stop offset="100%" stop-color="#0b72ff" />
      </linearGradient>
      <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10213f" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0e1b38" stop-opacity="0.75" />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3bc8f6" />
        <stop offset="100%" stop-color="#1d9bf0" />
      </linearGradient>
      <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="24" flood-color="#0ea5e9" flood-opacity="0.25" />
      </filter>
      <clipPath id="${clipId}">
        <rect x="0" y="0" width="180" height="180" rx="28" />
      </clipPath>
    </defs>
    <rect width="960" height="560" rx="36" fill="url(#cardGradient)" filter="url(#cardGlow)" />
    <rect x="24" y="24" width="912" height="512" rx="28" fill="#0b1530" opacity="0.38" />
    <rect x="40" y="40" width="880" height="480" rx="26" fill="url(#panelGradient)" stroke="#1f3b68" stroke-width="2" opacity="0.95" />
    <g opacity="0.25" stroke="#38bdf8" stroke-width="2" stroke-linecap="round">
      <path d="M120 120 H320 M180 160 H340 M120 420 H360" />
      <path d="M820 140 H640 M800 180 H620" />
      <circle cx="340" cy="120" r="6" fill="#38bdf8" />
      <circle cx="620" cy="180" r="6" fill="#38bdf8" />
    </g>
    <g transform="translate(80, 90)">
      <rect width="240" height="380" rx="30" fill="#0f1d3d" opacity="0.9" stroke="#1f3b68" />
      <rect x="30" y="26" width="180" height="180" rx="28" fill="#0b142c" stroke="#1d9bf0" opacity="0.6" />
      <g transform="translate(30, 26)">
        ${
          safePhoto
            ? `<image width="180" height="180" preserveAspectRatio="xMidYMid slice" href="${safePhoto}" clip-path="url(#${clipId})" />`
            : `<rect width="180" height="180" rx="28" fill="#102a54" /><text x="90" y="115" text-anchor="middle" font-size="68" font-weight="700" fill="#4ea6ff">${initials}</text>`
        }
      </g>
      <text x="120" y="250" text-anchor="middle" font-size="22" font-weight="700" fill="#e2e8f0">${safeName}</text>
      <text x="120" y="280" text-anchor="middle" font-size="14" fill="#8fb5ff">Student ID • ${safePublicId}</text>
      <g transform="translate(24, 310)">
        <rect width="192" height="56" rx="16" fill="#0b1226" opacity="0.8" stroke="#1d9bf0" />
        <text x="16" y="34" font-size="14" fill="#9fbadf">Issued</text>
        <text x="120" y="34" font-size="16" font-weight="600" fill="#e2e8f0" text-anchor="middle">${issuedOn}</text>
      </g>
    </g>
    <g transform="translate(360, 90)">
      <text x="0" y="24" font-size="14" letter-spacing="6" fill="#38bdf8">DIGITAL ID</text>
      <text x="0" y="70" font-size="38" font-weight="700" fill="#f8fafc">${INSTITUTE_INFO.name}</text>
      <text x="0" y="104" font-size="20" fill="#b8d5ff">${INSTITUTE_INFO.tagline}</text>
      <g transform="translate(0, 140)">
        <rect width="460" height="200" rx="22" fill="#0c182f" stroke="#1f3b68" />
        <g transform="translate(20, 28)" font-size="15" fill="#cdd8ef">
          <g transform="translate(0, 0)">
            <circle cx="12" cy="-4" r="10" fill="#0f4bd8" />
            <text x="32" y="0" font-weight="600" fill="#f8fafc">${safeName}</text>
            <text x="32" y="24" fill="#9fbadf">Student</text>
          </g>
          <g transform="translate(0, 64)">
            <circle cx="12" cy="-4" r="10" fill="#1fb2f1" />
            <text x="32" y="0" font-weight="600" fill="#f8fafc">${safeStudentEmail}</text>
            <text x="32" y="24" fill="#9fbadf">Student Email</text>
          </g>
          <g transform="translate(0, 128)">
            <circle cx="12" cy="-4" r="10" fill="#22d3ee" />
            <text x="32" y="0" font-weight="600" fill="#f8fafc">${safeGuardianEmail}</text>
            <text x="32" y="24" fill="#9fbadf">Guardian Email</text>
          </g>
        </g>
        <g transform="translate(320, 24)">
          <rect width="120" height="120" rx="16" fill="#0f1f3d" stroke="#1d9bf0" opacity="0.9" />
          ${
            safeQr
              ? `<image x="10" y="10" width="150" height="150" href="${safeQr}" />`
              : `<text x="60" y="70" text-anchor="middle" font-size="12" fill="#9fbadf">QR Pending</text>`
          }
          <text x="60" y="148" text-anchor="middle" font-size="12" fill="#8fb5ff">Scan for attendance</text>
        </g>
      </g>
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

    let qrCodeUrl = registration.qrCodeUrl ?? null;

    if (!qrCodeUrl) {
      const qrResult = await generateAndStoreStudentQrCode(registration.id);

      if (qrResult.success) {
        qrCodeUrl = qrResult.qrCodeUrl ?? null;
      } else {
        console.error(`Failed to generate QR code: ${qrResult.error}`);
      }
    }

    const cardData: SimpleIdCardData = {
      studentName: registration.name,
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      studentPhotoUrl: registration.studentPhotoUrl ?? null,
      qrCodeUrl,
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
