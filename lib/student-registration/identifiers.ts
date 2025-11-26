import type { PrismaClient } from "@/lib/generated/prisma/client";

type StudentClient = Pick<PrismaClient, "student">;

const STUDENT_ID_PREFIX = "STU";
const RANDOM_DIGITS = 5;

export async function generateStudentPublicId(
  prismaClient: StudentClient,
  referenceDate: Date = new Date()
): Promise<string> {
  const year = referenceDate.getFullYear();
  const prefix = `${STUDENT_ID_PREFIX}-${year}`;

  const randomDigits = () =>
    Math.floor(Math.random() * 10 ** RANDOM_DIGITS)
      .toString()
      .padStart(RANDOM_DIGITS, "0");

  while (true) {
    const candidate = `${prefix}${randomDigits()}`; // no space

    const exists = await prismaClient.student.findUnique({
      where: { studentPublicId: candidate },
      select: { studentPublicId: true },
    });

    if (!exists) return candidate;
  }
}
