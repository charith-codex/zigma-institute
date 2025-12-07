import { z } from "zod";

import { phoneNumberSchema } from "./common";

export const UserRoleEnum = z.enum([
  "STUDENT",
  "TEACHER",
  "ADMIN",
  "MANAGER",
  "ATTENDANCE",
]);

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
  phone: phoneNumberSchema,
  dob: z
    .string()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), "Date of Birth must be a valid date"),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  phone: phoneNumberSchema,
  address: z
    .string()
    .trim()
    .max(255, { message: "Address must be less than 255 characters" })
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  dob: z
    .string()
    .trim()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Date must be a valid date",
    }),
  gender: z
    .enum(["MALE", "FEMALE"])
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  profileImage: z
    .string()
    .trim()
    .url({ message: "Please provide a valid URL" })
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
});
