import { Buffer } from "node:buffer";

import { prisma } from "@/db/prisma";

const INSTITUTE_INFO = {
  name: "Zigma Institute",
  tagline: "AI-powered personalised learning for ambitious students.",
  address: "Colombo Innovation Hub, 512 Galle Road, Colombo 03",
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
  courses: string[];
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

function getCourseSummary(courses: string[]): string {
  if (!courses.length) {
    return "Courses will be assigned after approval";
  }

  if (courses.length === 1) {
    return courses[0];
  }

  const [first, second, ...rest] = courses;
  if (rest.length === 0) {
    return `${first} • ${second}`;
  }
  return `${first}, ${second} +${rest.length} more`;
}

function buildSimpleIdCardSvg(data: SimpleIdCardData): string {
  const issuedOn = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const initials = getInitials(data.studentName);
  const courseSummary = getCourseSummary(data.courses);

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
    <text x="60" y="220" font-size="32" font-weight="600" fill="#f1f5f9">${data.studentName}</text>
    <text x="60" y="260" font-size="18" fill="#cbd5f5">Student ID • ${data.studentPublicId}</text>
    <text x="60" y="300" font-size="18" fill="#94a3b8">Email • ${data.studentEmail}</text>
    <text x="60" y="340" font-size="18" fill="#94a3b8">Guardian • ${data.guardianEmail}</text>
    <text x="60" y="400" font-size="20" fill="#cbd5f5">Registered courses</text>
    <text x="60" y="440" font-size="18" fill="#f8fafc">${courseSummary}</text>
    <text x="60" y="480" font-size="16" fill="#94a3b8">Issued ${issuedOn}</text>
    <rect x="640" y="120" width="240" height="320" rx="24" fill="#1e293b" opacity="0.8" />
    <text x="760" y="260" text-anchor="middle" font-size="96" font-weight="700" fill="#1d4ed8" opacity="0.3">${initials}</text>
    <text x="760" y="420" text-anchor="middle" font-size="18" fill="#cbd5f5">${INSTITUTE_INFO.address}</text>
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

    const cardData: SimpleIdCardData = {
      studentName: registration.name,
      studentPublicId: registration.studentPublicId,
      studentEmail: registration.email,
      guardianEmail: registration.guardianEmail,
      courses: registration.courses
        .map((c) => c.course?.name)
        .filter((name): name is string => Boolean(name)),
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
