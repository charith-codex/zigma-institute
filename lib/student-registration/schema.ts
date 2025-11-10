import { Buffer } from "node:buffer";
import { z } from "zod";

const dateString = z
  .string({ required_error: "Date of birth is required" })
  .trim()
  .refine((value) => {
    if (!value) {
      return false;
    }

    const parsed = Date.parse(value);
    return !Number.isNaN(parsed);
  }, "Please provide a valid date of birth")
  .optional();

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please provide a valid email")
  .optional()
  .or(
    z
      .literal("")
      .transform(() => undefined)
  );

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must include the area code")
  .max(20, "Phone number is too long");

const baseRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name is too long"),
  email: z.string().trim().email("Please provide a valid email"),
  phone: phoneSchema,
  dob: dateString,
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address must be less than 255 characters"),
  parentEmail: optionalEmail,
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be under 500 characters")
    .optional(),
});

const jpegMimeType = /^image\/(jpeg|jpg)$/i;

export const studentRegistrationCheckoutSchema = baseRegistrationSchema.extend({
  profileImage: z.object({
    data: z
      .string()
      .min(1, "A profile photo is required")
      .refine(
        (value) => Buffer.byteLength(value, "base64") <= 4 * 1024 * 1024,
        "Profile photo must be less than 4MB"
      ),
    mimeType: z
      .string()
      .regex(jpegMimeType, "Only JPEG photos are supported for now"),
  }),
});

export const offlineStudentRegistrationSchema = baseRegistrationSchema.extend({
  profileImage: z.object({
    url: z.string().url("Profile photo URL is required"),
    fileKey: z.string().min(1, "Profile photo reference is missing"),
    mimeType: z
      .string()
      .regex(jpegMimeType, "Only JPEG photos are supported for now")
      .optional(),
  }),
});

export type StudentRegistrationCheckoutInput = z.infer<
  typeof studentRegistrationCheckoutSchema
>;
export type OfflineStudentRegistrationInput = z.infer<
  typeof offlineStudentRegistrationSchema
>;
