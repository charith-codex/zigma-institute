"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import { physicalExamSchema } from "@/lib/validators/physical-exam";

export interface EnrolledStudent {
  registrationId: string;
  studentPublicId: string;
  studentName: string;
}

export interface PhysicalExamMarkRecord {
  id: string;
  courseId: string;
  studentRegistrationId: string;
  studentPublicId: string;
  studentName: string;
  examTitle: string;
  examDate: string;
  paperUrl: string;
  score: number;
  recordedAt: string;
}

export interface PhysicalExamSummary {
  examTitle: string;
  examDate: string;
  paperUrl: string;
  studentCount: number;
  recordedAt: string;
}

export type SavePhysicalExamMarksResult =
  | { success: true; records: PhysicalExamMarkRecord[] }
  | { success: false; message: string };

export async function getEnrolledStudentsForCourse(
  courseId: string
): Promise<EnrolledStudent[]> {
  const trimmedCourseId = courseId.trim();

  if (!trimmedCourseId) {
    return [];
  }

  const courseRegistrations = await prisma.studentRegistrationCourse.findMany({
    where: {
      courseId: trimmedCourseId,
      registration: {
        status: { in: ["PAID", "APPROVED"] },
      },
    },
    include: { registration: true },
    orderBy: { registration: { name: "asc" } },
  });

  const students = courseRegistrations
    .map((record) => {
      const registration = record.registration;
      if (!registration) return null;

      const id = registration.id;
      const studentName = registration.name;
      const studentPublicId = registration.studentPublicId || registration.id;

      if (!id || !studentName) {
        return null;
      }

      return {
        registrationId: id,
        studentPublicId,
        studentName,
      } satisfies EnrolledStudent;
    })
    .filter((student): student is EnrolledStudent => Boolean(student));

  return convertToPlainObject(students);
}

export async function getPhysicalExamMarks(
  courseId: string
): Promise<PhysicalExamMarkRecord[]> {
  const trimmedCourseId = courseId.trim();

  if (!trimmedCourseId) {
    return [];
  }

  const marks = await prisma.physicalExamMark.findMany({
    where: { courseId: trimmedCourseId },
    orderBy: { recordedAt: "desc" },
  });

  return convertToPlainObject(
    marks.map((mark) => ({
      ...mark,
      examDate: mark.examDate.toISOString(),
      recordedAt: mark.recordedAt.toISOString(),
    }))
  );
}

export async function getPhysicalExamSummaries(
  courseId: string
): Promise<PhysicalExamSummary[]> {
  const trimmedCourseId = courseId.trim();
  if (!trimmedCourseId) return [];

  const marks = await prisma.physicalExamMark.findMany({
    where: { courseId: trimmedCourseId },
    orderBy: { recordedAt: "desc" },
  });

  // Group by title and date
  const summariesMap = new Map<string, PhysicalExamSummary>();

  for (const mark of marks) {
    const dateStr = mark.examDate.toISOString().split("T")[0];
    const key = `${mark.examTitle}-${dateStr}`;

    if (!summariesMap.has(key)) {
      summariesMap.set(key, {
        examTitle: mark.examTitle,
        examDate: mark.examDate.toISOString(),
        paperUrl: mark.paperUrl,
        studentCount: 0,
        recordedAt: mark.recordedAt.toISOString(),
      });
    }

    const summary = summariesMap.get(key)!;
    summary.studentCount += 1;
    // Keep the latest recordedAt
    if (new Date(mark.recordedAt) > new Date(summary.recordedAt)) {
      summary.recordedAt = mark.recordedAt.toISOString();
    }
  }

  return convertToPlainObject(Array.from(summariesMap.values()));
}

export async function savePhysicalExamMarks(
  input: z.infer<typeof physicalExamSchema>
): Promise<SavePhysicalExamMarksResult> {
  try {
    const payload = physicalExamSchema.parse(input);
    const trimmedCourseId = payload.courseId.trim();
    const trimmedExamTitle = payload.examTitle.trim();
    const examDateStr = payload.examDate;
    const examDate = new Date(examDateStr);

    const registrations = await prisma.studentRegistrationCourse.findMany({
      where: {
        courseId: trimmedCourseId,
        registration: {
          status: { in: ["PAID", "APPROVED"] },
        },
      },
      include: { registration: true },
    });

    const allowedRegistrations = new Map(
      registrations
        .filter((record) => Boolean(record.registration))
        .map((record) => {
          const registration = record.registration!;
          return [registration.id, registration];
        })
    );

    const validScores = payload.scores.filter((entry) =>
      allowedRegistrations.has(entry.studentRegistrationId)
    );

    if (validScores.length === 0) {
      return {
        success: false,
        message: "No eligible students found for this course.",
      };
    }

    const now = new Date();

    // Handle updates where title or date changed (to prevent duplicates)
    if (
      payload.originalExamTitle &&
      payload.originalExamDate &&
      (payload.originalExamTitle !== trimmedExamTitle ||
        payload.originalExamDate !== examDateStr)
    ) {
      const originalDate = new Date(payload.originalExamDate);
      await prisma.physicalExamMark.deleteMany({
        where: {
          courseId: trimmedCourseId,
          examTitle: payload.originalExamTitle,
          examDate: originalDate,
        },
      });
    }

    const transactions = validScores.map((entry) => {
      const registration = allowedRegistrations.get(
        entry.studentRegistrationId
      )!;

      return prisma.physicalExamMark.upsert({
        where: {
          courseId_studentRegistrationId_examTitle_examDate: {
            courseId: trimmedCourseId,
            studentRegistrationId: entry.studentRegistrationId,
            examTitle: trimmedExamTitle,
            examDate: examDate,
          },
        },
        update: {
          paperUrl: payload.paperUrl,
          score: entry.score,
          recordedAt: now,
        },
        create: {
          courseId: trimmedCourseId,
          studentRegistrationId: entry.studentRegistrationId,
          studentPublicId: registration.studentPublicId || registration.id,
          studentName: registration.name,
          examTitle: trimmedExamTitle,
          examDate: examDate,
          paperUrl: payload.paperUrl,
          score: entry.score,
          recordedAt: now,
        },
      });
    });

    const savedMarks = await prisma.$transaction(transactions);

    revalidatePath(`/cms/courses/${trimmedCourseId}`);

    return {
      success: true,
      records: convertToPlainObject(
        savedMarks
          .map((mark) => ({
            ...mark,
            examDate: mark.examDate.toISOString(),
            recordedAt: mark.recordedAt.toISOString(),
          }))
          .sort(
            (a, b) =>
              new Date(b.recordedAt).getTime() -
              new Date(a.recordedAt).getTime()
          )
      ),
    } satisfies SavePhysicalExamMarksResult;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save physical exam marks.";

    return { success: false, message } satisfies SavePhysicalExamMarksResult;
  }
}

export async function deletePhysicalExam(
  courseId: string,
  examTitle: string,
  examDate: string
) {
  try {
    const date = new Date(examDate);

    await prisma.physicalExamMark.deleteMany({
      where: {
        courseId,
        examTitle,
        examDate: date,
      },
    });

    revalidatePath(`/cms/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete physical exam:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete physical exam",
    };
  }
}
