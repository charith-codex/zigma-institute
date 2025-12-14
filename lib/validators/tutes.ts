import { z } from "zod";

export const tuteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tute name is required")
    .max(120, "Tute name must be 120 characters or fewer"),
  courseId: z.string().trim().min(1, "Course is required"),
});

export const tuteDistributionSchema = z.object({
  studentId: z.string().trim().min(1, "Student is required"),
  distributed: z.boolean(),
});
