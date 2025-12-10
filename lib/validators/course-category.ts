import { z } from "zod";

export const courseCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be 100 characters or less"),
});

export const courseCategoryWithIdSchema = courseCategorySchema.extend({
  id: z.string().uuid("A valid category id is required"),
});

export const courseCategoryIdSchema = z.object({
  id: z.string().uuid("A valid category id is required"),
});

export type CourseCategoryInput = z.infer<typeof courseCategorySchema>;
export type CourseCategoryWithIdInput = z.infer<typeof courseCategoryWithIdSchema>;
export type CourseCategoryIdInput = z.infer<typeof courseCategoryIdSchema>;
