import type { PrismaClient } from "@/lib/generated/prisma";

type StudentClient = Pick<PrismaClient, "student">;

const STUDENT_ID_PREFIX = "STU";
const ID_PADDING = 5;

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

  const lastNumber = lastStudent?.studentPublicId
    ?.split("-")
    .pop()
    ?.replace(/[^0-9]/g, "");

  const nextNumber = lastNumber ? Number.parseInt(lastNumber, 10) + 1 : 1;
  const paddedNumber = nextNumber.toString().padStart(ID_PADDING, "0");

  return `${prefix}${paddedNumber}`;
}
