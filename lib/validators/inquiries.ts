import { z } from "zod";

export const inquiryTypeOptions = [
  "general",
  "admission",
  "technical",
  "complaint",
  "feedback",
] as const;

export const inquiryStatusOptions = [
  "new",
  "in_progress",
  "resolved",
  "closed",
] as const;

export const createInquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  inquiryType: z.enum(inquiryTypeOptions),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(inquiryStatusOptions),
});

export const respondToInquirySchema = z.object({
  response: z
    .string()
    .trim()
    .min(5, "Response must be at least 5 characters"),
});

export type CreateInquiryInput = z.input<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.input<typeof updateInquiryStatusSchema>;
export type RespondToInquiryInput = z.input<typeof respondToInquirySchema>;
