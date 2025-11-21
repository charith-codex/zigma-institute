"use server";

import { z } from "zod";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";

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
  paperUrl: string;
  score: number;
  recordedAt: string;
}

const saveMarksSchema = z.object({
  courseId: z.string().min(1),
  examTitle: z.string().min(1),
  paperUrl: z.string().url(),
  scores: z
    .array(
      z.object({
        studentRegistrationId: z.string().min(1),
        score: z.number().min(0).max(100),
      })
    )
    .nonempty(),
});

export type SavePhysicalExamMarksInput = z.infer<typeof saveMarksSchema>;

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
      recordedAt: mark.recordedAt.toISOString(),
    }))
  );
}

export async function savePhysicalExamMarks(
  input: SavePhysicalExamMarksInput
): Promise<PhysicalExamMarkRecord[]> {
  const payload = saveMarksSchema.parse(input);
  const trimmedCourseId = payload.courseId.trim();
  const trimmedExamTitle = payload.examTitle.trim();

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
    throw new Error("No eligible students found for this course.");
  }

  const now = new Date();

  const transactions = validScores.map((entry) => {
    const registration = allowedRegistrations.get(entry.studentRegistrationId)!;

    return prisma.physicalExamMark.upsert({
      where: {
        courseId_studentRegistrationId_examTitle: {
          courseId: trimmedCourseId,
          studentRegistrationId: entry.studentRegistrationId,
          examTitle: trimmedExamTitle,
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
        paperUrl: payload.paperUrl,
        score: entry.score,
        recordedAt: now,
      },
    });
  });

  const savedMarks = await prisma.$transaction(transactions);

  return convertToPlainObject(
    savedMarks
      .map((mark) => ({
        ...mark,
        recordedAt: mark.recordedAt.toISOString(),
      }))
      .sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      )
  );
}
