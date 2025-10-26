import { z } from "zod";

// schema for inserting courses
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
  teacherName: z
    .string()
    .min(3, "Teacher name must be at least 3 characters")
    .max(100, "Teacher name must be less than 100 characters"),
});

// Schema for signing in a user
export const signInFormSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
