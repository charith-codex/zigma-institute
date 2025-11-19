import type { PrismaClient } from "@/lib/generated/prisma";

type StudentClient = Pick<PrismaClient, "student">;

const STUDENT_ID_PREFIX = "STU";
const ID_PADDING = 5;
const MAX_SEQUENCE = 99999;

export async function generateStudentPublicId(
  prismaClient: StudentClient,
  referenceDate: Date = new Date()
): Promise<string> {
  const year = referenceDate.getFullYear();
  const prefix = `${STUDENT_ID_PREFIX}-${year}`;

  const lastStudent = await prismaClient.student.findFirst({
    where: {
      studentPublicId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      studentPublicId: "desc",
    },
    select: {
      studentPublicId: true,
    },
  });

  const extractSequence = (value: string | null | undefined): number | null => {
    if (!value?.startsWith(prefix)) {
      return null;
    }

    const numericSuffix = value.slice(prefix.length).replace(/\D/g, "");
    if (numericSuffix.length === 0) {
      return null;
    }

    const parsed = Number.parseInt(numericSuffix, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  let nextSequence = extractSequence(lastStudent?.studentPublicId) ?? 0;

  while (nextSequence < MAX_SEQUENCE) {
    nextSequence += 1;

    const candidate = `${prefix}${nextSequence
      .toString()
      .padStart(ID_PADDING, "0")}`;

    // Guard against potential race conditions causing duplicate IDs
    const existing = await prismaClient.student.findFirst({
      where: { studentPublicId: candidate },
      select: { studentPublicId: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Student ID range exhausted for the current year");
}
