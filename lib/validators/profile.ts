import { z } from "zod";
import { phoneNumberSchema } from "./common";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string(),
  phone: phoneNumberSchema,
  address: z
    .string()
    .max(255, "Address must be less than 255 characters")
    .optional(),
  dob: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return !Number.isNaN(Date.parse(val));
      },
      { message: "Invalid date" }
    ),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
