"use server";

import { hashSync } from "bcrypt-ts-edge";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  staffCreateSchema,
  staffUpsertSchema,
  studentCreateSchema,
  studentUpsertSchema,
  teacherCreateSchema,
  teacherUpsertSchema,
  type StaffCreateValues,
  type StaffUpsertValues,
  type StudentCreateValues,
  type StudentUpsertValues,
  type TeacherCreateValues,
  type TeacherUpsertValues,
} from "@/lib/validators/eims-user-management";

const permittedRoles = ["ADMIN", "MANAGER"] as const;
const adminOnlyRoles = ["ADMIN"] as const;

type PermittedRole = (typeof permittedRoles)[number];

type BaseActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const ensureAuthorized = async (
  allowedRoles: readonly PermittedRole[] = permittedRoles
): Promise<BaseActionResult<PermittedRole>> => {
  const session = await auth();

  if (
    !session?.user?.role ||
    !allowedRoles.includes(session.user.role as PermittedRole)
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

const normalizeOptionalPassword = (value?: string | null) =>
  value && value.trim().length > 0 ? value.trim() : null;

const normalizeOptionalGender = (
  value?: string | null
): "MALE" | "FEMALE" | null => {
  if (!value || value.length === 0) {
    return null;
  }

  return value === "MALE" || value === "FEMALE" ? value : null;
};

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  parentEmail: string | null;
  studentPublicId: string | null;
  idCardUrl: string | null;
  dob: string | null;
  gender: "MALE" | "FEMALE" | null;
  profileImage: string | null;
  enrollments: Array<{ id: string; name: string }>;
  payments: Array<{
    id: string;
    amountInCents: number;
    currency: string;
    paidAt: string;
    courseId: string | null;
    paidMonth: number | null;
    paidYear: number | null;
  }>;
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
  gender: "MALE" | "FEMALE" | null;
  profileImage: string | null;
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
  gender: "MALE" | "FEMALE" | null;
  profileImage: string | null;
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
  createdAt: Date;
  updatedAt: Date;
  gender?: "MALE" | "FEMALE" | null;
  profileImage?: string | null;
  student: {
    parentEmail: string | null;
    studentPublicId: string | null;
    idCardUrl: string | null;
    enrollments: Array<{ course: { id: string; name: string } }>;
  } | null;
  paymentTransactions: Array<{
    id: string;
    amountInCents: number;
    currency: string;
    paidAt: Date;
    paymentType: string;
    courseId: string | null;
    paidMonth: number | null;
    paidYear: number | null;
  }>;
}): StudentRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  status: user.status,
  parentEmail: user.student?.parentEmail ?? null,
  studentPublicId: user.student?.studentPublicId ?? null,
  idCardUrl: user.student?.idCardUrl ?? null,
  dob: serializeDate(user.dob),
  gender: user.gender ?? null,
  profileImage: user.profileImage ?? null,
  enrollments:
    user.student?.enrollments.map((e) => ({
      id: e.course.id,
      name: e.course.name,
    })) ?? [],
  payments: user.paymentTransactions.map((p) => ({
    id: p.id,
    amountInCents: p.amountInCents,
    currency: p.currency,
    paidAt: serializeDate(p.paidAt)!,
    courseId: p.courseId,
    paidMonth: p.paidMonth,
    paidYear: p.paidYear,
  })),
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
  createdAt: Date;
  updatedAt: Date;
  gender?: "MALE" | "FEMALE" | null;
  profileImage?: string | null;
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
  gender: user.gender ?? null,
  profileImage: user.profileImage ?? null,
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
  createdAt: Date;
  updatedAt: Date;
  gender?: "MALE" | "FEMALE" | null;
  profileImage?: string | null;
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
  gender: user.gender ?? null,
  profileImage: user.profileImage ?? null,
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
      include: {
        student: {
          include: {
            enrollments: {
              include: {
                course: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        paymentTransactions: {
          orderBy: { paidAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: students.map(serializeStudent as unknown as any),
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
  input: StudentCreateValues
): Promise<BaseActionResult<StudentRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = studentCreateSchema.parse(input);
    const password = normalizeOptionalPassword(payload.password);

    const created = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: "STUDENT",
        dob: payload.dob ? new Date(payload.dob) : null,
        profileImage: normalizeOptionalString(payload.profileImage),
        gender: normalizeOptionalGender(payload.gender),
        password: password ? hashSync(password, 10) : undefined,
        student: {
          create: {
            parentEmail: normalizeOptionalString(payload.parentEmail),
            studentPublicId: normalizeOptionalString(payload.studentPublicId),
          },
        },
      },
      include: {
        student: {
          include: {
            enrollments: {
              include: {
                course: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        paymentTransactions: {
          orderBy: { paidAt: "desc" },
        },
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: serializeStudent(created as unknown as any),
    };
  } catch (error) {
    console.error("Failed to create student", error);
    return {
      success: false,
      error:
        error instanceof ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to create student.",
    };
  }
}

export async function updateStudent(
  input: StudentUpsertValues
): Promise<BaseActionResult<StudentRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = studentUpsertSchema.parse(input);
    const password = normalizeOptionalPassword(payload.password);

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        profileImage: normalizeOptionalString(payload.profileImage),
        gender: normalizeOptionalGender(payload.gender),
        dob: payload.dob ? new Date(payload.dob) : null,
        ...(password
          ? {
              password: hashSync(password, 10),
            }
          : {}),
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
      include: {
        student: {
          include: {
            enrollments: {
              include: {
                course: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        paymentTransactions: {
          orderBy: { paidAt: "desc" },
        },
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: serializeStudent(updated as unknown as any),
    };
  } catch (error) {
    console.error("Failed to update student", error);
    return {
      success: false,
      error:
        error instanceof ZodError
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
  input: TeacherCreateValues
): Promise<BaseActionResult<TeacherRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = teacherCreateSchema.parse(input);
    const password = normalizeOptionalPassword(payload.password);

    const created = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: "TEACHER",
        dob: payload.dob ? new Date(payload.dob) : null,
        profileImage: normalizeOptionalString(payload.profileImage),
        gender: normalizeOptionalGender(payload.gender),
        password: password ? hashSync(password, 10) : undefined,
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
        error instanceof ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to create teacher.",
    };
  }
}

export async function updateTeacher(
  input: TeacherUpsertValues
): Promise<BaseActionResult<TeacherRecord>> {
  const authorization = await ensureAuthorized();
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = teacherUpsertSchema.parse(input);
    const password = normalizeOptionalPassword(payload.password);

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        profileImage: normalizeOptionalString(payload.profileImage),
        gender: normalizeOptionalGender(payload.gender),
        dob: payload.dob ? new Date(payload.dob) : null,
        ...(password
          ? {
              password: hashSync(password, 10),
            }
          : {}),
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
        error instanceof ZodError
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
  const authorization = await ensureAuthorized(adminOnlyRoles);
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
  input: StaffCreateValues
): Promise<BaseActionResult<StaffRecord>> {
  const authorization = await ensureAuthorized(adminOnlyRoles);
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = staffCreateSchema.parse(input);
    const password = normalizeOptionalPassword(payload.password);

    const created = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: payload.role,
        dob: payload.dob ? new Date(payload.dob) : null,
        profileImage: normalizeOptionalString(payload.profileImage),
        gender: normalizeOptionalGender(payload.gender),
        password: password ? hashSync(password, 10) : undefined,
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
        error instanceof ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to create staff member.",
    };
  }
}

export async function updateStaff(
  input: StaffUpsertValues
): Promise<BaseActionResult<StaffRecord>> {
  const authorization = await ensureAuthorized(adminOnlyRoles);
  if (!authorization.success) {
    return authorization;
  }

  try {
    const payload = staffUpsertSchema.parse(input);
    const password = normalizeOptionalPassword(payload.password);

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        email: payload.email,
        phone: normalizeOptionalString(payload.phone),
        address: normalizeOptionalString(payload.address),
        status: payload.status,
        role: payload.role,
        profileImage: normalizeOptionalString(payload.profileImage),
        gender: normalizeOptionalGender(payload.gender),
        dob: payload.dob ? new Date(payload.dob) : null,
        ...(password
          ? {
              password: hashSync(password, 10),
            }
          : {}),
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
        error instanceof ZodError
          ? (error.issues[0]?.message ?? "Invalid input.")
          : "Failed to update staff member.",
    };
  }
}

export async function deleteStaff(id: string): Promise<BaseActionResult<null>> {
  const authorization = await ensureAuthorized(adminOnlyRoles);
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
