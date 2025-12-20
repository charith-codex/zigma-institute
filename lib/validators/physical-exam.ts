import { z } from "zod";

export const physicalExamScoreSchema = z.object({
  studentRegistrationId: z
    .string()
    .min(1, "Student registration ID is required"),
  score: z.number().min(0).max(100, "Score must be between 0 and 100"),
});

export const physicalExamSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  examTitle: z.string().min(1, "Exam title is required"),
  examDate: z.string().min(1, "Exam date is required"),
  paperUrl: z.string().url("Valid paper URL is required"),
  scores: z
    .array(physicalExamScoreSchema)
    .min(1, "At least one student score is required"),
  // Original identifiers for updates that change title/date
  originalExamTitle: z.string().optional(),
  originalExamDate: z.string().optional(),
});

export type PhysicalExamInput = z.infer<typeof physicalExamSchema>;
export type PhysicalExamScoreInput = z.infer<typeof physicalExamScoreSchema>;
