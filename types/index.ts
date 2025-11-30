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

export type StudentRegistrationStatus = "PENDING" | "PAID" | "APPROVED" | "FAILED";

export type GenderValue = "MALE" | "FEMALE";

export interface StudentRegistrationSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  gender: GenderValue | null;
  guardianEmail: string;
  status: StudentRegistrationStatus;
  totalAmountInCents: number;
  currency: string;
  createdAt: Date;
  idCardUrl: string | null;
  qrCodeUrl: string | null;
  studentPublicId: string | null;
  studentUserId: string | null;
  courses: string[];
}
