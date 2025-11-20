import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ScheduleEvent {
  id: string;
  courseId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  status:
    | "pending_staff_approval"
    | "pending_teacher_confirmation"
    | "approved"
    | "rejected";
  createdBy: "teacher" | "staff";
  teacherId: string;
  teacherName: string;
  notes?: string;
  recurring?: boolean;
  createdAt: string;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingEvents: ScheduleEvent[];
}

const STORAGE_KEY = "zigma_schedules";

// Mock hardcoded data for demo
const MOCK_SCHEDULES: ScheduleEvent[] = [
  {
    id: "sched-1",
    courseId: "cs101",
    className: "Computer Science Fundamentals",
    date: "2024-12-09",
    startTime: "09:00",
    endTime: "10:30",
    dayOfWeek: "Monday",
    status: "approved",
    createdBy: "teacher",
    teacherId: "teacher-1",
    teacherName: "Dr. Sarah Johnson",
    recurring: true,
    createdAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "sched-2",
    courseId: "math201",
    className: "Advanced Mathematics",
    date: "2024-12-10",
    startTime: "11:00",
    endTime: "12:30",
    dayOfWeek: "Tuesday",
    status: "approved",
    createdBy: "staff",
    teacherId: "teacher-2",
    teacherName: "Prof. Michael Chen",
    recurring: true,
    createdAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "sched-3",
    courseId: "phys301",
    className: "Physics for Engineers",
    date: "2024-12-11",
    startTime: "14:00",
    endTime: "15:30",
    dayOfWeek: "Wednesday",
    status: "pending_staff_approval",
    createdBy: "teacher",
    teacherId: "teacher-3",
    teacherName: "Dr. Emma Wilson",
    recurring: false,
    createdAt: "2024-12-02T00:00:00Z",
  },
];

export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize with mock data
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSchedules(JSON.parse(stored));
    } else {
      setSchedules(MOCK_SCHEDULES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SCHEDULES));
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever schedules change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules, loading]);

  const addSchedule = (schedule: Omit<ScheduleEvent, "id" | "createdAt">) => {
    const newSchedule: ScheduleEvent = {
      ...schedule,
      id: `sched-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSchedules((prev) => [...prev, newSchedule]);
    toast({
      title: "Schedule Created",
      description: `Schedule for ${schedule.className} has been submitted for ${
        schedule.createdBy === "teacher"
          ? "staff approval"
          : "teacher confirmation"
      }.`,
    });

    return newSchedule;
  };

  const updateScheduleDetails = (
    scheduleId: string,
    updates: Partial<Omit<ScheduleEvent, "id" | "createdAt">>
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      )
    );

    toast({
      title: "Schedule Updated",
      description: "Schedule details have been saved.",
    });
  };

  const updateScheduleStatus = (
    scheduleId: string,
    status: ScheduleEvent["status"],
    notes?: string
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, status, notes } : schedule
      )
    );

    toast({
      title: "Schedule Updated",
      description: `Schedule has been ${status.replace("_", " ")}.`,
    });
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.filter((schedule) => schedule.id !== scheduleId)
    );
    toast({
      title: "Schedule Deleted",
      description: "Schedule has been removed.",
    });
  };

  const checkConflicts = (
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): ConflictCheck => {
    const conflictingEvents = schedules.filter((schedule) => {
      if (excludeId && schedule.id === excludeId) return false;
      if (schedule.date !== date) return false;
      if (schedule.status === "rejected") return false;

      // Check time overlap
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
  };

  const getSchedulesByTeacher = (teacherId: string) => {
    return schedules.filter((schedule) => schedule.teacherId === teacherId);
  };

  const getSchedulesByStatus = (status: ScheduleEvent["status"]) => {
    return schedules.filter((schedule) => schedule.status === status);
  };

  const getApprovedSchedules = () => {
    return schedules.filter((schedule) => schedule.status === "approved");
  };

  return {
    schedules,
    loading,
    addSchedule,
    updateScheduleDetails,
    updateScheduleStatus,
    deleteSchedule,
    checkConflicts,
    getSchedulesByTeacher,
    getSchedulesByStatus,
    getApprovedSchedules,
  };
}
