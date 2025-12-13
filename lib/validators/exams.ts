import { z } from "zod";

export const examQuestionSchema = z.object({
  questionId: z.string().uuid(),
  order: z.number().int().nonnegative(),
  marks: z.number().int().min(1),
});

export const createExamSchema = z.object({
  title: z.string().min(1, "Exam title is required"),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  instructions: z.string().optional(),
  timeLimit: z
    .number()
    .int()
    .min(1, "Time limit must be at least 1 minute")
    .max(300, "Time limit cannot exceed 300 minutes")
    .optional(),
  createdById: z.string().uuid().optional(),
  publish: z.boolean().optional(),
  questions: z.array(examQuestionSchema).min(1, "Add at least one question"),
});

export const updateExamSchema = z.object({
  title: z.string().optional(),
  instructions: z.string().nullable().optional(),
  timeLimit: z
    .number()
    .int()
    .min(1, "Time limit must be at least 1 minute")
    .max(300, "Time limit cannot exceed 300 minutes")
    .nullable()
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  publish: z.boolean().optional(),
});

export const answerSchema = z.object({
  questionId: z.string().uuid(),
  type: z.enum(["MCQ", "ESSAY"]),
  selectedOption: z.string().optional(),
  answerText: z.string().optional(),
});

export const submissionSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().min(1, "Student identifier is required"),
  studentName: z.string().optional(),
  answers: z.array(answerSchema).min(1, "Provide at least one answer"),
});
