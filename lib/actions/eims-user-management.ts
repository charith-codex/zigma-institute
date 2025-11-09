"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const permittedRoles = ["ADMIN", "MANAGER"] as const;

type PermittedRole = (typeof permittedRoles)[number];

type BaseActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const studentUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().trim().min(1).optional().or(z.literal("")),
  address: z.string().trim().min(1).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  parentEmail: z.string().email().optional().or(z.literal("")),
  studentPublicId: z.string().trim().min(1).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
});

const teacherUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().trim().min(1).optional().or(z.literal("")),
  address: z.string().trim().min(1).optional().or(z.literal("")),
  qualification: z.string().trim().optional().or(z.literal("")),
  nic: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  dob: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
});

const staffUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().trim().min(1).optional().or(z.literal("")),
  address: z.string().trim().min(1).optional().or(z.literal("")),
  nic: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "ATTENDANCE"] as const),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  dob: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
});

type StudentPayload = z.infer<typeof studentUpsertSchema>;
type TeacherPayload = z.infer<typeof teacherUpsertSchema>;
type StaffPayload = z.infer<typeof staffUpsertSchema>;

const ensureAuthorized = async (): Promise<BaseActionResult<PermittedRole>> => {
  const session = await auth();

  if (
    !session?.user?.role ||
    !permittedRoles.includes(session.user.role as PermittedRole)
  ) {
    return {
      success: false,
      error: "You are not authorized to perform this action.",
    };
  }

  return { success: true, data: session.user.role as PermittedRole };
};

const serializeDate = (value: Date | null | undefined) =>
  value ? value.toISOString() : null;

const normalizeOptionalString = (value?: string | null) =>
  value && value.length > 0 ? value : null;

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  parentEmail: string | null;
  studentPublicId: string | null;
  dob: string | null;
  joinDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeacherRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  qualification: string | null;
  nic: string | null;
  dob: string | null;
  joinDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  role: "ADMIN" | "MANAGER" | "ATTENDANCE";
  nic: string | null;
  dob: string | null;
  joinDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const serializeStudent = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  dob: Date | null;
  joinDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    parentEmail: string | null;
    studentPublicId: string | null;
  } | null;
}): StudentRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  status: user.status,
  parentEmail: user.student?.parentEmail ?? null,
  studentPublicId: user.student?.studentPublicId ?? null,
  dob: serializeDate(user.dob),
  joinDate: serializeDate(user.joinDate),
  createdAt: serializeDate(user.createdAt)!,
  updatedAt: serializeDate(user.updatedAt)!,
});

const serializeTeacher = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  dob: Date | null;
  joinDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    qualification: string | null;
    nic: string | null;
  } | null;
}): TeacherRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  status: user.status,
  qualification: user.teacher?.qualification ?? null,
  nic: user.teacher?.nic ?? null,
  dob: serializeDate(user.dob),
  joinDate: serializeDate(user.joinDate),
  createdAt: serializeDate(user.createdAt)!,
  updatedAt: serializeDate(user.updatedAt)!,
});

const serializeStaff = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  // Accept broader role type from Prisma result; we'll narrow on return
  role: string;
  dob: Date | null;
  joinDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  staff: {
    nic: string | null;
  } | null;
}): StaffRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  status: user.status,
  role: user.role as StaffRecord["role"],
  nic: user.staff?.nic ?? null,
  dob: serializeDate(user.dob),
  joinDate: serializeDate(user.joinDate),
  createdAt: serializeDate(user.createdAt)!,
  updatedAt: serializeDate(user.updatedAt)!,
});

export async function listStudents(): Promise<
  BaseActionResult<StudentRecord[]>
> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: students.map(serializeStudent),
    };
  } catch (error) {
    console.error("Failed to list students", error);
    return {
      success: false,
      error: "Failed to load students.",
    };
  }
}

export async function createStudent(
  input: Omit<StudentPayload, "id">
): Promise<BaseActionResult<StudentRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = studentUpsertSchema.omit({ id: true }).parse(input);

    const created = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: "STUDENT",
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
        student: {
          create: {
            parentEmail: normalizeOptionalString(payload.parentEmail),
            studentPublicId: normalizeOptionalString(payload.studentPublicId),
          },
        },
      },
      include: { student: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeStudent(created),
    };
  } catch (error) {
    console.error("Failed to create student", error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to create student.",
    };
  }
}

export async function updateStudent(
  input: StudentPayload
): Promise<BaseActionResult<StudentRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = studentUpsertSchema.parse(input);

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
        student: {
          upsert: {
            create: {
              parentEmail: normalizeOptionalString(payload.parentEmail),
              studentPublicId: normalizeOptionalString(payload.studentPublicId),
            },
            update: {
              parentEmail: normalizeOptionalString(payload.parentEmail),
              studentPublicId: normalizeOptionalString(payload.studentPublicId),
            },
          },
        },
      },
      include: { student: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeStudent(updated),
    };
  } catch (error) {
    console.error("Failed to update student", error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to update student.",
    };
  }
}

export async function deleteStudent(
  id: string
): Promise<BaseActionResult<null>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete student", error);
    return {
      success: false,
      error: "Failed to delete student.",
    };
  }
}

export async function listTeachers(): Promise<
  BaseActionResult<TeacherRecord[]>
> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: teachers.map(serializeTeacher),
    };
  } catch (error) {
    console.error("Failed to list teachers", error);
    return {
      success: false,
      error: "Failed to load teachers.",
    };
  }
}

export async function createTeacher(
  input: Omit<TeacherPayload, "id">
): Promise<BaseActionResult<TeacherRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = teacherUpsertSchema.omit({ id: true }).parse(input);

    const created = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: "TEACHER",
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
        teacher: {
          create: {
            qualification: normalizeOptionalString(payload.qualification),
            nic: normalizeOptionalString(payload.nic),
          },
        },
      },
      include: { teacher: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeTeacher(created),
    };
  } catch (error) {
    console.error("Failed to create teacher", error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to create teacher.",
    };
  }
}

export async function updateTeacher(
  input: TeacherPayload
): Promise<BaseActionResult<TeacherRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = teacherUpsertSchema.parse(input);

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
        teacher: {
          upsert: {
            create: {
              qualification: normalizeOptionalString(payload.qualification),
              nic: normalizeOptionalString(payload.nic),
            },
            update: {
              qualification: normalizeOptionalString(payload.qualification),
              nic: normalizeOptionalString(payload.nic),
            },
          },
        },
      },
      include: { teacher: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeTeacher(updated),
    };
  } catch (error) {
    console.error("Failed to update teacher", error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to update teacher.",
    };
  }
}

export async function deleteTeacher(
  id: string
): Promise<BaseActionResult<null>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete teacher", error);
    return {
      success: false,
      error: "Failed to delete teacher.",
    };
  }
}

export async function listStaff(): Promise<BaseActionResult<StaffRecord[]>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const staffMembers = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER", "ATTENDANCE"] } },
      include: { staff: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: staffMembers.map(serializeStaff),
    };
  } catch (error) {
    console.error("Failed to list staff", error);
    return {
      success: false,
      error: "Failed to load staff members.",
    };
  }
}

export async function createStaff(
  input: Omit<StaffPayload, "id">
): Promise<BaseActionResult<StaffRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = staffUpsertSchema.omit({ id: true }).parse(input);

    const created = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: payload.role,
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
        staff: {
          create: {
            nic: normalizeOptionalString(payload.nic),
          },
        },
      },
      include: { staff: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeStaff(created),
    };
  } catch (error) {
    console.error("Failed to create staff", error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to create staff member.",
    };
  }
}

export async function updateStaff(
  input: StaffPayload
): Promise<BaseActionResult<StaffRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = staffUpsertSchema.parse(input);

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: payload.role,
        dob: payload.dob ? new Date(payload.dob) : null,
        joinDate: payload.joinDate ? new Date(payload.joinDate) : null,
        staff: {
          upsert: {
            create: { nic: normalizeOptionalString(payload.nic) },
            update: { nic: normalizeOptionalString(payload.nic) },
          },
        },
      },
      include: { staff: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeStaff(updated),
    };
  } catch (error) {
    console.error("Failed to update staff", error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to update staff member.",
    };
  }
}

export async function deleteStaff(id: string): Promise<BaseActionResult<null>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete staff", error);
    return {
      success: false,
      error: "Failed to delete staff member.",
    };
  }
}
