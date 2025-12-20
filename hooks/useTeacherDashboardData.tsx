"use client";

import { useMemo } from "react";
import { useCourseSummaries, type CourseSummary } from "@/hooks/useData";
import { useSession } from "next-auth/react";

export interface TeacherInfo {
  name: string;
  id: string;
  department: string;
  totalStudents: number;
  activeCourses: number;
}

export interface TeacherDashboardData {
  accessibleCourses: CourseSummary[];
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
  const { courseSummaries, loading } = useCourseSummaries();
  const { data: session, status } = useSession();

  const sessionLoading = status === "loading";
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role ?? null;
  const isAdmin = role === "ADMIN";
  const isTeacher = role === "TEACHER";

  const accessibleCourses = useMemo(() => {
    if (isAdmin) {
      return courseSummaries;
    }

    if (isTeacher && userId) {
      return courseSummaries.filter((cls) => cls.teacher_id === userId);
    }

    return [];
  }, [courseSummaries, isAdmin, isTeacher, userId]);

  const teacherInfo = useMemo<TeacherInfo>(() => {
    const teacherId = userId ? userId.slice(0, 8).toUpperCase() : "TEA000000";

    return {
      name: session?.user?.name || "Teacher",
      id: teacherId,
      department: isAdmin ? "Administration" : "Computer Science",
      totalStudents: accessibleCourses.reduce(
        (sum, cls) => sum + (cls.enrolled_students || 0),
        0
      ),
      activeCourses: accessibleCourses.length,
    };
  }, [accessibleCourses, isAdmin, session?.user?.name, userId]);

  const isAuthenticated = Boolean(session?.user);

  return {
    accessibleCourses,
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
