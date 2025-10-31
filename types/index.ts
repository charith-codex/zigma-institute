import { z } from "zod";
import { courseSchema } from "@/lib/validators";

export type Course = Omit<z.infer<typeof courseSchema>, "price"> & {
  id: string;
  priceInCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};
