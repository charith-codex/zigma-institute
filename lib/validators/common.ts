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

export const optionalUrl = z
  .string()
  .trim()
  .url({ message: "Please provide a valid URL" })
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM (24h) format");
