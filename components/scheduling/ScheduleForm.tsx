"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleEvent, type ConflictCheck } from "@/hooks/useSchedules";
import { Checkbox } from "@/components/ui/checkbox";

interface CourseOption {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
}

export interface SchedulePayload {
  courseId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teacherName: string;
  notes?: string;
  recurring?: boolean;
}

interface ScheduleFormProps {
  courseOptions: CourseOption[];
  onSubmit: (payload: SchedulePayload) => void;
  initialValues?: ScheduleEvent;
  defaultDate?: string;
  onCancel?: () => void;
  checkConflicts?: (
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) => ConflictCheck;
}

const defaultTimes = {
  startTime: "09:00",
  endTime: "10:30",
};

function getDayOfWeek(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleDateString(undefined, { weekday: "long" });
}

export function ScheduleForm({
  courseOptions,
  onSubmit,
  initialValues,
  defaultDate,
  onCancel,
  checkConflicts,
}: ScheduleFormProps) {
  const [courseId, setCourseId] = useState<string>(
    initialValues?.courseId ?? courseOptions[0]?.id ?? ""
  );
  const [date, setDate] = useState<string>(
    initialValues?.date ?? defaultDate ?? new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<string>(
    initialValues?.startTime ?? defaultTimes.startTime
  );
  const [endTime, setEndTime] = useState<string>(
    initialValues?.endTime ?? defaultTimes.endTime
  );
  const [notes, setNotes] = useState<string>(initialValues?.notes ?? "");
  const [recurring, setRecurring] = useState<boolean>(
    Boolean(initialValues?.recurring)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courseOptions.find((option) => option.id === courseId),
    [courseId, courseOptions]
  );

  useEffect(() => {
    if (!courseId && courseOptions.length > 0) {
      setCourseId(courseOptions[0].id);
    }
  }, [courseId, courseOptions]);

  const handleSubmit = () => {
    if (!courseId || !selectedCourse) {
      setValidationError("Please select a course to schedule.");
      return;
    }

    if (endTime <= startTime) {
      setValidationError("End time must be after the start time.");
      return;
    }

    const conflict = checkConflicts?.(date, startTime, endTime, initialValues?.id);

    if (conflict?.hasConflict) {
      setValidationError("The selected time conflicts with another scheduled session.");
      return;
    }

    const payload: SchedulePayload = {
      courseId,
      className: selectedCourse.name,
      date,
      startTime,
      endTime,
      teacherId: selectedCourse.teacherId,
      teacherName: selectedCourse.teacherName,
      notes: notes.trim() || undefined,
      recurring,
    };

    onSubmit(payload);
    setValidationError(null);
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
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
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="recurring"
          checked={recurring}
          onCheckedChange={(value) => setRecurring(Boolean(value))}
        />
        <Label htmlFor="recurring" className="text-sm text-muted-foreground">
          Repeat weekly on {getDayOfWeek(date)}
        </Label>
      </div>

      {validationError ? (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Sessions automatically inherit the selected course instructor.
        </p>
        <div className="flex gap-2">
          {onCancel ? (
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          ) : null}
          <Button type="button" onClick={handleSubmit}>
            {initialValues ? "Save Changes" : "Add Schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
}
