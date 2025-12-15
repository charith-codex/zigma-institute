import { useCallback, useEffect, useState } from "react";

import { CourseTuteLedger } from "@/types";

const normalizeLedger = (entry: unknown): CourseTuteLedger | null => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const { studentId, tutes } = entry as { studentId?: unknown; tutes?: unknown };

  if (typeof studentId !== "string" || !Array.isArray(tutes)) {
    return null;
  }

  const normalizedTutes = tutes
    .map((tute) => {
      if (!tute || typeof tute !== "object") {
        return null;
      }

      const { id, name, distributedAt } = tute as {
        id?: unknown;
        name?: unknown;
        distributedAt?: unknown;
      };

      if (typeof id !== "string" || typeof name !== "string") {
        return null;
      }

      return {
        id,
        name,
        distributedAt: distributedAt ? new Date(distributedAt as string) : null,
      };
    })
    .filter((tute): tute is { id: string; name: string; distributedAt: Date | null } => Boolean(tute));

  return { studentId, tutes: normalizedTutes };
};

export function useCourseTuteLedger(courseId: string | null) {
  const [ledger, setLedger] = useState<Record<string, CourseTuteLedger>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setLedger({});
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/tute-distributions`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load tute distributions");
      }

      const payload = await response.json();
      const normalized = Array.isArray(payload)
        ? payload
            .map((entry) => normalizeLedger(entry))
            .filter((entry): entry is CourseTuteLedger => Boolean(entry))
        : [];

      const mapped = normalized.reduce<Record<string, CourseTuteLedger>>((acc, entry) => {
        acc[entry.studentId] = entry;
        return acc;
      }, {});

      setLedger(mapped);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch course tute ledger", fetchError);
      setLedger({});
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load course tute distributions"
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const updateEntry = useCallback(
    (studentId: string, tute: { id: string; name: string }, distributed: boolean) => {
      setLedger((previous) => {
        const existing = previous[studentId]?.tutes ?? [];

        const filtered = existing.filter((entry) => entry.id !== tute.id);
        const updated = distributed
          ? [
              ...filtered,
              {
                id: tute.id,
                name: tute.name,
                distributedAt: new Date(),
              },
            ]
          : filtered;

        return {
          ...previous,
          [studentId]: {
            studentId,
            tutes: updated,
          },
        };
      });
    },
    []
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ledger, loading, error, refetch, updateEntry };
}
