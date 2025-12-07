import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().min(2, "Student name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  address: z
    .string()
    .max(200, "Address must be 200 characters or fewer")
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["MALE", "FEMALE"] as const)
    .optional()
    .or(z.literal("")),
  guardianEmail: z.string().email("Enter a valid guardian email"),
  courses: z.array(z.string()).min(1, "Select at least one course"),
  studentPhoto: z
    .object({
      url: z.string().url(),
      key: z.string().min(1),
    })
    .optional(),
});

export const registrationRequestSchema = registrationSchema.extend({
  address: z.string().max(200).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  studentPhoto: z.object({ url: z.string().url(), key: z.string().min(1) }),
});

export const statusFilterSchema = z
  .array(z.enum(["PENDING", "PAID", "APPROVED", "FAILED"]))
  .nonempty()
  .catch(["PAID", "APPROVED"]);

export const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PAID", "APPROVED", "FAILED"]),
});
