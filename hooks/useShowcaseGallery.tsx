import { useCallback, useEffect, useState } from "react";

import type { InstituteAchievement, ShowcaseStudent } from "@/types";

interface ShowcaseState {
  students: ShowcaseStudent[];
  achievements: InstituteAchievement[];
}

export function useShowcaseGallery() {
  const [data, setData] = useState<ShowcaseState>({ students: [], achievements: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/showcase");

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load showcase entries");
      }

      const payload = (await response.json()) as Partial<ShowcaseState>;
      const students = Array.isArray(payload.students)
        ? payload.students.map((student) => ({
            ...student,
            createdAt: new Date(student.createdAt ?? new Date()),
            updatedAt: new Date(student.updatedAt ?? new Date()),
          }))
        : [];

      const achievements = Array.isArray(payload.achievements)
        ? payload.achievements.map((achievement) => ({
            ...achievement,
            createdAt: new Date(achievement.createdAt ?? new Date()),
            updatedAt: new Date(achievement.updatedAt ?? new Date()),
          }))
        : [];

      setData({ students, achievements });
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch showcase entries", fetchError);
      setData({ students: [], achievements: [] });
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load showcase entries"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...data, loading, error, refetch };
}
