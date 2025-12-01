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

async function toInlineImageData(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch student photo: ${response.statusText}`);
      return null;
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Failed to inline student photo:", error);
    return null;
  }
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
  <svg width="980" height="580" viewBox="0 0 980 580" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#071222" />
        <stop offset="50%" stop-color="#0b2147" />
        <stop offset="100%" stop-color="#0b72ff" />
      </linearGradient>
      <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0e1a33" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#0c1629" stop-opacity="0.85" />
      </linearGradient>
      <filter id="softGlow">
        <feDropShadow dx="0" dy="8" stdDeviation="24" flood-color="#3bbcff" flood-opacity="0.25" />
      </filter>
      <clipPath id="${clipId}">
        <rect width="200" height="200" rx="32" />
      </clipPath>
    </defs>
    <rect width="980" height="580" rx="40" fill="url(#cardGradient)" filter="url(#softGlow)" />
    <rect x="30" y="30" width="920" height="520" rx="30" fill="#0b1226aa" stroke="#1d4ed8" stroke-opacity="0.35" stroke-width="2" />
    <g transform="translate(60, 70)">
      <rect width="280" height="440" rx="28" fill="#0d1834cc" stroke="#1e40af" stroke-opacity="0.35" stroke-width="2" />
      <g transform="translate(40, 40)">
        <rect width="200" height="200" rx="32" fill="#0e1a33" stroke="#38bdf8" stroke-width="2" opacity="0.6" />
        ${
          safePhoto
            ? `<image width="200" height="200" preserveAspectRatio="xMidYMid slice" href="${safePhoto}" clip-path="url(#${clipId})" />`
            : `<text x="100" y="120" text-anchor="middle" font-size="70" font-weight="700" fill="#4ea6ff">${initials}</text>`
        }
      </g>
      <text x="140" y="280" text-anchor="middle" font-size="16" font-weight="500" fill="#9fbadf">Student ID</text>
      <text x="140" y="305" text-anchor="middle" font-size="20" font-weight="700" fill="#e2e8f0">${safePublicId}</text>
      <g transform="translate(34, 340)">
        <rect width="212" height="70" rx="16" fill="#0a1428" stroke="#1d9bf0" stroke-width="2" opacity="0.9" />
        <text x="106" y="28" text-anchor="middle" font-size="14" font-weight="500" fill="#9fbadf">Issued On</text>
        <text x="106" y="50" text-anchor="middle" font-size="18" font-weight="700" fill="#e2e8f0">${issuedOn}</text>
      </g>
    </g>
    <g transform="translate(380, 70)">
      <text x="0" y="24" font-size="14" font-weight="600" letter-spacing="4" fill="#38bdf8">STUDENT IDENTITY CARD</text>
      <text x="0" y="64" font-size="38" font-weight="700" fill="#f8fafc">${INSTITUTE_INFO.name}</text>
      <text x="0" y="94" font-size="19" font-weight="500" fill="#b8d5ff">${INSTITUTE_INFO.tagline}</text>
      <g transform="translate(0, 130)">
        <rect width="540" height="310" rx="26" fill="url(#panelGradient)" stroke="#1e3a8a" stroke-width="2" />
        <g transform="translate(32, 45)">
          <text x="0" y="20" font-size="13" font-weight="600" fill="#94a3b8">Full Name</text>
          <text x="0" y="44" font-size="17" font-weight="700" fill="#f8fafc">${safeName}</text>
          <text x="0" y="95" font-size="13" font-weight="600" fill="#94a3b8">Student Email</text>
          <text x="0" y="119" font-size="15" font-weight="600" fill="#e2e8f0">${safeStudentEmail}</text>
          <text x="0" y="170" font-size="13" font-weight="600" fill="#94a3b8">Guardian Email</text>
          <text x="0" y="194" font-size="15" font-weight="600" fill="#e2e8f0">${safeGuardianEmail}</text>
        </g>
        <g transform="translate(320, 40)">
          <rect width="180" height="180" rx="18" fill="#0f1f3d" stroke="#3b82f6" stroke-width="3" />
          ${
            safeQr
              ? `<image x="15" y="15" width="150" height="150" href="${safeQr}" />`
              : `<text x="90" y="96" text-anchor="middle" font-size="18" fill="#9fbadf">QR Code</text>`
          }
        </g>
        <text x="410" y="250" text-anchor="middle" font-size="15" font-weight="600" fill="#8fb5ff">Scan for Attendance</text>
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

    let studentPhotoUrl = registration.studentPhotoUrl ?? null;

    if (studentPhotoUrl) {
      const inlinePhoto = await toInlineImageData(studentPhotoUrl);

      if (inlinePhoto) {
        studentPhotoUrl = inlinePhoto;
      }
    }

    const cardData: SimpleIdCardData = {
      studentName: registration.name,
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      studentPhotoUrl,
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
