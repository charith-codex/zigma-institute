"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleEvent } from "@/hooks/useSchedules";

interface CourseOption {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
}

export interface SchedulePayload {
  courseId: string;

  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface ScheduleFormProps {
  courseOptions: CourseOption[];
  onSubmit: (payload: SchedulePayload) => Promise<void> | void;
  initialValues?: ScheduleEvent;
  defaultDate?: string;
  submitting?: boolean;
  onDelete?: () => Promise<void> | void;
  deleting?: boolean;
}

const defaultTimes = {
  startTime: "09:00",
  endTime: "10:30",
};

export function ScheduleForm({
  courseOptions,
  onSubmit,
  initialValues,
  defaultDate,
  submitting = false,
  onDelete,
  deleting = false,
}: ScheduleFormProps) {
  const [courseId, setCourseId] = useState<string>(
    initialValues?.courseId ?? courseOptions[0]?.id ?? ""
  );
  const [date, setDate] = useState<string>(
    initialValues?.date ?? defaultDate ?? format(new Date(), "yyyy-MM-dd")
  );
  const [startTime, setStartTime] = useState<string>(
    initialValues?.startTime ?? defaultTimes.startTime
  );
  const [endTime, setEndTime] = useState<string>(
    initialValues?.endTime ?? defaultTimes.endTime
  );
  const [notes, setNotes] = useState<string>(initialValues?.notes ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isSubmitting = submitting || saving;
  const showDeleteAction = Boolean(initialValues && onDelete);
  const isBusy = isSubmitting || deleting;

  const selectedCourse = useMemo(
    () => courseOptions.find((option) => option.id === courseId),
    [courseId, courseOptions]
  );

  useEffect(() => {
    if (!courseId && courseOptions.length > 0) {
      setCourseId(courseOptions[0].id);
    }
  }, [courseId, courseOptions]);

  const handleSubmit = async () => {
    if (!courseId || !selectedCourse) {
      setValidationError("Please select a course to schedule.");
      return;
    }

    if (endTime <= startTime) {
      setValidationError("End time must be after the start time.");
      return;
    }

    const payload: SchedulePayload = {
      courseId,

      date,
      startTime,
      endTime,
      notes: notes.trim() || undefined,
    };

    try {
      setSaving(true);
      await onSubmit(payload);
      setValidationError(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger id="course">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courseOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes or requirements for this session"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isBusy}
        />
      </div>

      {validationError ? (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-wrap gap-2">
          {showDeleteAction ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void handleDelete();
              }}
              disabled={isSubmitting || deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isBusy}
          >
            {initialValues
              ? isSubmitting
                ? "Saving..."
                : "Save"
              : isSubmitting
                ? "Adding..."
                : "Scheduled"}
          </Button>
        </div>
      </div>
    </div>
  );
}
