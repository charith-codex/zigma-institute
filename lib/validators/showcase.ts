import { z } from "zod";

export const showcaseStudentCategorySchema = z.enum(["ISLAND", "DISTRICT"]);

const showcaseStudentShape = z.object({
  name: z.string().min(2, "Name is required"),
  grade: z.string().min(1, "Grade is required"),
  subject: z.string().min(1, "Subject is required"),
  position: z.string().min(1, "Position is required"),
  score: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(3000),
  district: z.string().optional(),
  avatarUrl: z.string().url({ message: "Image URL must be valid" }).optional(),
  category: showcaseStudentCategorySchema,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const validateDistrictRequirement = (value: z.infer<typeof showcaseStudentShape>, ctx: z.RefinementCtx) => {
  if (value.category === "DISTRICT" && !value.district?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "District is required for district rankings",
      path: ["district"],
    });
  }
};

export const showcaseStudentFormSchema = showcaseStudentShape.superRefine(
  validateDistrictRequirement,
);

export const showcaseStudentUpdateSchema = showcaseStudentShape
  .extend({
    id: z.string().min(1),
  })
  .superRefine(validateDistrictRequirement);

export const achievementIconSchema = z.enum([
  "Trophy",
  "Zap",
  "Target",
  "Award",
  "Users",
  "TrendingUp",
  "Medal",
  "Star",
]);

export const instituteAchievementFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().min(2, "Category is required"),
  year: z.coerce.number().int().min(2000).max(3000),
  description: z.string().min(10, "Description is required"),
  icon: achievementIconSchema,
  accentColor: z
    .enum(["yellow", "blue", "green", "purple", "orange", "emerald", "pink"])
    .default("yellow"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const instituteAchievementUpdateSchema = instituteAchievementFormSchema.extend({
  id: z.string().min(1),
});

export type ShowcaseStudentFormValues = z.infer<typeof showcaseStudentFormSchema>;
export type InstituteAchievementFormValues = z.infer<
  typeof instituteAchievementFormSchema
>;
