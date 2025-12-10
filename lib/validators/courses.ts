import { z } from "zod";

export const courseSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format, use lowercase and hyphens only"
    )
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters"),
  coverImage: z.string(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description is too long"),
  teacherId: z.string().min(1, "Teacher is required"),
  teacherName: z
    .string()
    .min(3, "Teacher name must be at least 3 characters")
    .max(100, "Teacher name must be less than 100 characters"),
  courseCategoryId: z.string().min(1, "Course category is required"),
  price: z.coerce
    .number("Price is required")
    .finite("Price must be a valid number")
    .gt(0, "Price must be greater than 0"),
});

export const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Lesson title must be at least 3 characters long"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  courseId: z
    .string()
    .trim()
    .min(1, "A course must be selected for the lesson"),
});
