import { z } from "zod";

export const attendanceParamsSchema = z.object({
  sessionId: z.string().min(1),
});

export const createSessionSchema = z.object({
  courseId: z.string().min(1).optional().nullable(),
  courseName: z.string().min(1),
  sessionDate: z.string().min(1),
});

export const markSchema = z.object({
  sessionId: z.string().min(1),
  studentPublicId: z.string().min(1),
  studentName: z.string().min(1),
  registrationId: z.string().optional().nullable(),
});
