import { z } from "zod";
import { courseSchema } from "@/lib/validators";

export type Course = z.infer<typeof courseSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
