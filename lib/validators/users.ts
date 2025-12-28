import { z } from "zod";

import {
  optionalDateString,
  optionalGender,
  optionalString,
  passwordSchema,
  phoneNumberSchema,
} from "./common";

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
  password: passwordSchema,
  role: UserRoleEnum,
  address: z
    .string()
    .max(255, { message: "Address must be less than 255 characters" })
    .optional(),
  phone: phoneNumberSchema,
  dob: z
    .string()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)),
      "Date of Birth must be a valid date"
    ),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  phone: phoneNumberSchema,
  address: optionalString(255),
  dob: optionalDateString,
  gender: optionalGender,
});
