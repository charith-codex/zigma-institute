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
  teacherId: z.string().min(1, "Teacher is required"),
  teacherName: z
    .string()
    .min(3, "Teacher name must be at least 3 characters")
    .max(100, "Teacher name must be less than 100 characters"),
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

// Schema for signing in a user
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const UserRoleEnum = z.enum([
  "STUDENT",
  "TEACHER",
  "ADMIN",
  "MANAGER",
  "ATTENDANCE",
]);

// Schema for creating a user from the admin dashboard
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),

  email: z.string().trim().email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),

  role: UserRoleEnum,

  address: z
    .string()
    .max(255, { message: "Address must be less than 255 characters" })
    .optional(),

  phone: z.string().regex(/^[0-9]{10,15}$/, {
    message: "Phone number must contain only digits (10–15 digits)",
  }),

  dob: z
    .string()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Date of Birth must be a valid date"
    ),

  joinDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Join Date must be a valid date"
    ),
});
