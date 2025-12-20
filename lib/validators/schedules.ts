import { z } from "zod";

import { timeStringSchema } from "./common";

export const scheduleSchema = z
  .object({
    courseId: z.string().trim().min(1, "Course is required"),

    date: z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Date must be a valid date",
      }),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    dayOfWeek: z.string().trim().min(2, "Day of week is required"),
    notes: z.string().trim().optional(),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "End time must be after the start time",
    path: ["endTime"],
  });

export const scheduleUpdateSchema = scheduleSchema
  .partial()
  .superRefine((value, ctx) => {
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after the start time",
        path: ["endTime"],
      });
    }
  });
