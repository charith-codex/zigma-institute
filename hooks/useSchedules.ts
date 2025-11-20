import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast";

export interface ScheduleEvent {
  id: string;
  courseId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  teacherName?: string;
  notes?: string;
  recurring?: boolean;
  createdAt: string;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingEvents: ScheduleEvent[];
}

interface ScheduleResponse {
  id: string;
  courseId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  notes?: string | null;
  recurring?: boolean | null;
  createdAt: string;
  course?: { teacherName?: string | null };
}

function formatDateOnly(value: string): string {
  const [day] = value.split("T");
  return day ?? value;
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapSchedule = useCallback((value: ScheduleResponse): ScheduleEvent => {
    return {
      ...value,
      date: formatDateOnly(value.date),
      notes: value.notes ?? undefined,
      recurring: Boolean(value.recurring),
      teacherName: value.teacherName ?? value.course?.teacherName ?? undefined,
    };
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/schedules");

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to load schedules");
      }

      const payload = await response.json();
      const normalized: ScheduleEvent[] = Array.isArray(payload)
        ? payload
            .filter(
              (item): item is ScheduleResponse =>
                Boolean(item?.id) && Boolean(item?.courseId)
            )
            .map(mapSchedule)
        : [];

      setSchedules(normalized);
    } catch (error) {
      console.error("Failed to load schedules", error);
      setSchedules([]);
      toast({
        title: "Unable to load schedules",
        description:
          error instanceof Error
            ? error.message
            : "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mapSchedule, toast]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  const addSchedule = useCallback(
    async (schedule: Omit<ScheduleEvent, "id" | "createdAt">) => {
      try {
        const response = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(schedule),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to create schedule");
        }

        const created = mapSchedule((await response.json()) as ScheduleResponse);
        setSchedules((prev) => [...prev, created]);

        toast({
          title: "Schedule Created",
          description: `Scheduled ${schedule.className} on ${schedule.date} at ${schedule.startTime}.`,
        });

        return created;
      } catch (error) {
        toast({
          title: "Unable to create schedule",
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [mapSchedule, toast]
  );

  const updateScheduleDetails = useCallback(
    async (
      scheduleId: string,
      updates: Partial<Omit<ScheduleEvent, "id" | "createdAt">>
    ) => {
      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to update schedule");
        }

        const updated = mapSchedule((await response.json()) as ScheduleResponse);
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === scheduleId ? { ...schedule, ...updated } : schedule
          )
        );

        toast({
          title: "Schedule Updated",
          description: "Schedule details have been saved.",
        });

        return updated;
      } catch (error) {
        toast({
          title: "Unable to update schedule",
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [mapSchedule, toast]
  );

  const deleteSchedule = useCallback(
    async (scheduleId: string) => {
      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to delete schedule");
        }

        setSchedules((prev) =>
          prev.filter((schedule) => schedule.id !== scheduleId)
        );

        toast({
          title: "Schedule Deleted",
          description: "Schedule has been removed.",
        });
      } catch (error) {
        toast({
          title: "Unable to delete schedule",
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const checkConflicts = useCallback(
    (
      date: string,
      startTime: string,
      endTime: string,
      excludeId?: string
    ): ConflictCheck => {
      const conflictingEvents = schedules.filter((schedule) => {
        if (excludeId && schedule.id === excludeId) return false;
        if (schedule.date !== date) return false;

        const scheduleStart = schedule.startTime;
        const scheduleEnd = schedule.endTime;

        return (
          (startTime >= scheduleStart && startTime < scheduleEnd) ||
          (endTime > scheduleStart && endTime <= scheduleEnd) ||
          (startTime <= scheduleStart && endTime >= scheduleEnd)
        );
      });

      return {
        hasConflict: conflictingEvents.length > 0,
        conflictingEvents,
      };
    },
    [schedules]
  );

  return {
    schedules,
    loading,
    addSchedule,
    updateScheduleDetails,
    deleteSchedule,
    checkConflicts,
    refresh: loadSchedules,
  };
}
