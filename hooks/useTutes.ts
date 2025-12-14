import { useCallback, useEffect, useMemo, useState } from "react";

import { Tute, TuteDistributionStatus } from "@/types";

const normalizeTute = (tute: unknown): Tute | null => {
  if (!tute || typeof tute !== "object") {
    return null;
  }

  const { id, name, courseId, createdAt, updatedAt, distributedCount } = tute as {
    id?: unknown;
    name?: unknown;
    courseId?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    distributedCount?: unknown;
  };

  if (typeof id !== "string" || typeof name !== "string" || typeof courseId !== "string") {
    return null;
  }

  return {
    id,
    name,
    courseId,
    createdAt: createdAt ? new Date(createdAt as string) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt as string) : new Date(),
    distributedCount:
      typeof distributedCount === "number" && Number.isFinite(distributedCount)
        ? distributedCount
        : 0,
  };
};

const normalizeDistribution = (distribution: unknown): TuteDistributionStatus | null => {
  if (!distribution || typeof distribution !== "object") {
    return null;
  }

  const { id, tuteId, studentId, distributed, distributedAt, createdAt, updatedAt } =
    distribution as {
      id?: unknown;
      tuteId?: unknown;
      studentId?: unknown;
      distributed?: unknown;
      distributedAt?: unknown;
      createdAt?: unknown;
      updatedAt?: unknown;
    };

  if (
    typeof id !== "string" ||
    typeof tuteId !== "string" ||
    typeof studentId !== "string" ||
    typeof distributed !== "boolean"
  ) {
    return null;
  }

  return {
    id,
    tuteId,
    studentId,
    distributed,
    distributedAt: distributedAt ? new Date(distributedAt as string) : null,
    createdAt: createdAt ? new Date(createdAt as string) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt as string) : new Date(),
  };
};

export function useCourseTutes(courseId: string | null) {
  const [tutes, setTutes] = useState<Tute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setTutes([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tutes?courseId=${courseId}`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load tutes");
      }

      const payload = await response.json();
      const normalized = Array.isArray(payload)
        ? payload
            .map((item) => normalizeTute(item))
            .filter((item): item is Tute => Boolean(item))
        : [];

      setTutes(normalized);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch tutes", fetchError);
      setTutes([]);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load tutes");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const createTute = useCallback(
    async (name: string) => {
      if (!courseId) {
        throw new Error("Select a course before creating a tute.");
      }

      const response = await fetch("/api/tutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, courseId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create tute");
      }

      const payload = await response.json();
      const normalized = normalizeTute(payload);

      if (!normalized) {
        throw new Error("Received malformed tute data.");
      }

      setTutes((previous) => [normalized, ...previous]);
      return normalized;
    },
    [courseId]
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { tutes, loading, error, refetch, createTute };
}

export function useTuteDistributions(tuteId: string | null) {
  const [distributions, setDistributions] = useState<Record<string, TuteDistributionStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!tuteId) {
      setDistributions({});
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tutes/${tuteId}/distributions`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load distributions");
      }

      const payload = await response.json();
      const normalized = Array.isArray(payload)
        ? payload
            .map((entry) => normalizeDistribution(entry))
            .filter((entry): entry is TuteDistributionStatus => Boolean(entry))
        : [];

      const map = normalized.reduce<Record<string, TuteDistributionStatus>>((acc, entry) => {
        acc[entry.studentId] = entry;
        return acc;
      }, {});

      setDistributions(map);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch tute distributions", fetchError);
      setDistributions({});
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load tute distributions"
      );
    } finally {
      setLoading(false);
    }
  }, [tuteId]);

  const updateDistribution = useCallback(
    async (studentId: string, distributed: boolean) => {
      if (!tuteId) {
        throw new Error("Select a tute before updating distribution.");
      }

      setUpdatingStudentId(studentId);

      try {
        const response = await fetch(`/api/tutes/${tuteId}/distributions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, distributed }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to update distribution");
        }

        const payload = await response.json();
        const normalized = normalizeDistribution(payload);

        if (!normalized) {
          throw new Error("Received malformed distribution data.");
        }

        setDistributions((previous) => ({ ...previous, [normalized.studentId]: normalized }));

        return normalized;
      } finally {
        setUpdatingStudentId(null);
      }
    },
    [tuteId]
  );

  const distributedStudentIds = useMemo(
    () =>
      new Set(
        Object.values(distributions)
          .filter((entry) => entry.distributed)
          .map((entry) => entry.studentId)
      ),
    [distributions]
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    distributions,
    distributedStudentIds,
    loading,
    error,
    updatingStudentId,
    refetch,
    updateDistribution,
  };
}
