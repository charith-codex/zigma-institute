"use client";

import { useMemo } from "react";
import { useClasses, type ClassSummary } from "@/hooks/useData";
import { useSession } from "next-auth/react";

export interface TeacherInfo {
  name: string;
  id: string;
  department: string;
  totalStudents: number;
  activeClasses: number;
}

export interface TeacherDashboardData {
  accessibleClasses: ClassSummary[];
  combinedLoading: boolean;
  loading: boolean;
  sessionLoading: boolean;
  isAuthenticated: boolean;
  teacherInfo: TeacherInfo;
  session: ReturnType<typeof useSession>["data"];
  role: string | null;
  userId: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
}

export function useTeacherDashboardData(): TeacherDashboardData {
  const { classes, loading } = useClasses();
  const { data: session, status } = useSession();

  const sessionLoading = status === "loading";
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role ?? null;
  const isAdmin = role === "ADMIN";
  const isTeacher = role === "TEACHER";

  const accessibleClasses = useMemo(() => {
    if (isAdmin) {
      return classes;
    }

    if (isTeacher && userId) {
      return classes.filter((cls) => cls.teacher_id === userId);
    }

    return [];
  }, [classes, isAdmin, isTeacher, userId]);

  const teacherInfo = useMemo<TeacherInfo>(() => {
    const teacherId = userId ? userId.slice(0, 8).toUpperCase() : "TEA000000";

    return {
      name: session?.user?.name || "Teacher",
      id: teacherId,
      department: isAdmin ? "Administration" : "Computer Science",
      totalStudents: accessibleClasses.reduce(
        (sum, cls) => sum + (cls.enrolled_students || 0),
        0
      ),
      activeClasses: accessibleClasses.length,
    };
  }, [accessibleClasses, isAdmin, session?.user?.name, userId]);

  const isAuthenticated = Boolean(session?.user);

  return {
    accessibleClasses,
    combinedLoading: loading || sessionLoading,
    loading,
    sessionLoading,
    isAuthenticated,
    teacherInfo,
    session,
    role,
    userId,
    isAdmin,
    isTeacher,
  };
}