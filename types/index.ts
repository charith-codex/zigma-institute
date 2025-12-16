import { z } from "zod";
import { courseSchema } from "@/lib/validators";

export type Course = Omit<z.infer<typeof courseSchema>, "price" | "teacherId"> & {
  id: string;
  teacherId: string | null;
  courseCategoryId: string;
  courseCategory?: CourseCategory | null;
  priceInCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CourseCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface CourseStudentSummary {
  id: string;
  name: string;
  studentPublicId: string | null;
  email: string | null;
}

export interface Tute {
  id: string;
  name: string;
  courseId: string;
  distributedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TuteDistributionStatus {
  id: string;
  tuteId: string;
  studentId: string;
  distributed: boolean;
  distributedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseTuteLedger {
  studentId: string;
  tutes: { id: string; name: string; distributedAt: Date | null }[];
}

export type ShowcaseStudentCategory = "ISLAND" | "DISTRICT";

export interface ShowcaseStudent {
  id: string;
  name: string;
  grade: string;
  subject: string;
  position: string;
  score?: string | null;
  year: number;
  district?: string | null;
  avatarUrl?: string | null;
  category: ShowcaseStudentCategory;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstituteAchievement {
  id: string;
  title: string;
  category: string;
  year: number;
  description: string;
  icon: string;
  accentColor: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
