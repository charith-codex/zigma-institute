import { z } from "zod";
import { courseSchema } from "@/lib/validators";

export type Course = Omit<z.infer<typeof courseSchema>, "price" | "teacherId"> & {
  id: string;
  teacherId: string | null;
  priceInCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface TeacherSummary {
  id: string;
  name: string;
  email: string | null;
}
