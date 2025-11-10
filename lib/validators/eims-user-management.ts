import { z } from "zod";

const optionalPasswordSchema = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters long")
  .optional()
  .or(z.literal(""));

const optionalDateSchema = z
  .string()
  .trim()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Please provide a valid date",
  })
  .optional()
  .or(z.literal(""));

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Please provide a valid URL")
  .optional()
  .or(z.literal(""));

const optionalEmailSchema = z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .optional()
  .or(z.literal(""));

const optionalStringSchema = z
  .string()
  .trim()
  .min(1, "This field is required")
  .optional()
  .or(z.literal(""));

const optionalGenderSchema = z
  .enum(["MALE", "FEMALE"])
  .optional()
  .or(z.literal(""));

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{7,15}$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const studentUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: phoneSchema,
  address: optionalStringSchema,
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  parentEmail: optionalEmailSchema,
  studentPublicId: optionalStringSchema,
  dob: optionalDateSchema,
  joinDate: optionalDateSchema,
  gender: optionalGenderSchema,
  profileImage: optionalUrlSchema,
  password: optionalPasswordSchema,
});

export const teacherUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: phoneSchema,
  address: optionalStringSchema,
  qualification: optionalStringSchema,
  nic: optionalStringSchema,
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  dob: optionalDateSchema,
  joinDate: optionalDateSchema,
  gender: optionalGenderSchema,
  profileImage: optionalUrlSchema,
  password: optionalPasswordSchema,
});

export const staffUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: phoneSchema,
  address: optionalStringSchema,
  nic: optionalStringSchema,
  role: z.enum(["ADMIN", "MANAGER", "ATTENDANCE"] as const),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  dob: optionalDateSchema,
  joinDate: optionalDateSchema,
  gender: optionalGenderSchema,
  profileImage: optionalUrlSchema,
  password: optionalPasswordSchema,
});

export const studentCreateSchema = studentUpsertSchema
  .omit({ id: true })
  .refine((data) => !!data.password && data.password.trim().length > 0, {
    path: ["password"],
    message: "Password is required",
  });

export const teacherCreateSchema = teacherUpsertSchema
  .omit({ id: true })
  .refine((data) => !!data.password && data.password.trim().length > 0, {
    path: ["password"],
    message: "Password is required",
  });

export const staffCreateSchema = staffUpsertSchema
  .omit({ id: true })
  .refine((data) => !!data.password && data.password.trim().length > 0, {
    path: ["password"],
    message: "Password is required",
  });

export type StudentCreateValues = z.input<typeof studentCreateSchema>;
export type StudentUpsertValues = z.input<typeof studentUpsertSchema>;
export type TeacherCreateValues = z.input<typeof teacherCreateSchema>;
export type TeacherUpsertValues = z.input<typeof teacherUpsertSchema>;
export type StaffCreateValues = z.input<typeof staffCreateSchema>;
export type StaffUpsertValues = z.input<typeof staffUpsertSchema>;
