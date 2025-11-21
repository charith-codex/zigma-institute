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

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Reset token is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Include at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM (24h) format");

export const scheduleSchema = z
  .object({
    courseId: z.string().trim().min(1, "Course is required"),
    className: z.string().trim().min(1, "Class name is required"),
    date: z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Date must be a valid date",
      }),
    startTime: timeString,
    endTime: timeString,
    dayOfWeek: z.string().trim().min(2, "Day of week is required"),
    notes: z.string().trim().optional(),
    recurring: z.boolean().optional(),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "End time must be after the start time",
    path: ["endTime"],
  });

export const scheduleUpdateSchema = scheduleSchema.partial().superRefine((value, ctx) => {
  if (value.startTime && value.endTime && value.endTime <= value.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after the start time",
      path: ["endTime"],
    });
  }
});
