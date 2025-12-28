import { z } from "zod";

export const phoneNumberSchema = z.string().regex(/^[0-9]{10,15}$/, {
  message: "Phone number must contain only digits (10–15 digits)",
});

export const optionalString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, { message: `Must be less than ${maxLength} characters` })
    .optional()
    .transform((value) => (value === "" ? undefined : value));

export const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Date must be a valid date",
  });

export const optionalGender = z
  .enum(["MALE", "FEMALE"])
  .optional()
  .transform((value) => value ?? undefined);

export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM (24h) format");

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Include at least one number" });

export const optionalPasswordSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((val) => !val || val.length >= 8, {
    message: "Password must be at least 8 characters",
  })
  .refine((val) => !val || /[A-Z]/.test(val), {
    message: "Include at least one uppercase letter",
  })
  .refine((val) => !val || /[a-z]/.test(val), {
    message: "Include at least one lowercase letter",
  })
  .refine((val) => !val || /[0-9]/.test(val), {
    message: "Include at least one number",
  });
