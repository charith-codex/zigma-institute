import { useCallback, useEffect, useState } from "react";

import { CourseStudentSummary } from "@/types";

const normalizeStudent = (student: unknown): CourseStudentSummary | null => {
  if (!student || typeof student !== "object") {
    return null;
  }

  const { id, name, studentPublicId, email } = student as {
    id?: unknown;
    name?: unknown;
    studentPublicId?: unknown;
    email?: unknown;
  };

  if (typeof id !== "string") {
    return null;
  }

  return {
    id,
    name: typeof name === "string" && name.trim().length > 0 ? name : "Student",
    studentPublicId: typeof studentPublicId === "string" ? studentPublicId : null,
    email: typeof email === "string" ? email : null,
  };
};

export function useCourseStudents(courseId: string | null) {
  const [students, setStudents] = useState<CourseStudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setStudents([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/students`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load students");
      }

      const payload = await response.json();
      const normalized = Array.isArray(payload)
        ? payload
            .map((student) => normalizeStudent(student))
            .filter((student): student is CourseStudentSummary => Boolean(student))
        : [];

      setStudents(normalized);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch course students", fetchError);
      setStudents([]);
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { students, loading, error, refetch };
}
