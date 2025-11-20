"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User } from "lucide-react";
import { ScheduleCalendar } from "@/components/scheduling/ScheduleCalendar";
import { ScheduleForm, type SchedulePayload } from "@/components/scheduling/ScheduleForm";
import { ScheduleEvent, useSchedules } from "@/hooks/useSchedules";

export interface CourseOption {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
}

interface CourseScheduleManagerProps {
  courseOptions: CourseOption[];
  heading: string;
  description: string;
  mode?: "view" | "manage";
}

function getDayOfWeek(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleDateString(undefined, { weekday: "long" });
}

function EventDetails({
  event,
  courseName,
  teacherName,
}: {
  event: ScheduleEvent;
  courseName?: string;
  teacherName?: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">Course</p>
        <p className="text-base font-semibold">{courseName ?? event.className}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Clock className="h-4 w-4" />
          <div>
            <p className="font-semibold">
              {event.startTime} – {event.endTime}
            </p>
            <p className="text-xs text-muted-foreground">{event.dayOfWeek}</p>
          </div>
        </div>
        {teacherName ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <User className="h-4 w-4" />
            <div>
              <p className="font-semibold">{teacherName}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>
        ) : null}
      </div>
      {event.notes ? (
        <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3">
          <MapPin className="mt-1 h-4 w-4 text-primary" />
          <p className="text-sm text-foreground">{event.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function CourseScheduleManager({
  courseOptions,
  heading,
  description,
  mode = "view",
}: CourseScheduleManagerProps) {
  const {
    schedules,
    addSchedule,
    updateScheduleDetails,
    deleteSchedule,
    checkConflicts,
    loading,
  } = useSchedules();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeEvent, setActiveEvent] = useState<ScheduleEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const visibleSchedules = useMemo(() => {
    const allowedIds = new Set(courseOptions.map((course) => course.id));
    return schedules.filter((event) => allowedIds.has(event.courseId));
  }, [courseOptions, schedules]);

  const courseNames = useMemo(
    () =>
      courseOptions.reduce<Record<string, string>>((accumulator, option) => {
        accumulator[option.id] = option.name;
        return accumulator;
      }, {}),
    [courseOptions]
  );

  const courseTeachers = useMemo(
    () =>
      courseOptions.reduce<Record<string, string>>((accumulator, option) => {
        if (option.teacherName) {
          accumulator[option.id] = option.teacherName;
        }
        return accumulator;
      }, {}),
    [courseOptions]
  );

  const selectedDateKey = selectedDate.toISOString().split("T")[0];

  const openCreateDialog = (date: Date) => {
    if (mode !== "manage") return;
    setDraftDate(date);
    setActiveEvent(null);
    setDialogOpen(true);
  };

  const openEventDialog = (event: ScheduleEvent) => {
    setSelectedDate(new Date(event.date));
    setActiveEvent(event);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setActiveEvent(null);
    setDraftDate(null);
  };

  const handleSubmit = async (payload: SchedulePayload) => {
    try {
      setSubmitting(true);
      if (activeEvent) {
        await updateScheduleDetails(activeEvent.id, {
          ...payload,
          dayOfWeek: getDayOfWeek(payload.date),
        });
      } else {
        await addSchedule({
          ...payload,
          dayOfWeek: getDayOfWeek(payload.date),
        });
      }

      closeDialog();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activeEvent) return;
    try {
      setDeleting(true);
      await deleteSchedule(activeEvent.id);
      closeDialog();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{heading}</h2>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">
            {loading ? "Loading schedules..." : `${visibleSchedules.length} scheduled sessions`}
          </Badge>
          <Badge variant="secondary">{courseOptions.length} courses</Badge>
        </div>
        {courseOptions.length === 0 ? (
          <p className="text-sm text-destructive">
            No courses available. Add courses to start scheduling sessions.
          </p>
        ) : null}
      </div>

      <ScheduleCalendar
        events={visibleSchedules}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onCreate={openCreateDialog}
        onEventSelect={(event) => {
          if (mode === "manage") {
            openEventDialog(event);
          } else {
            setActiveEvent(event);
            setDialogOpen(true);
          }
        }}
        courseNames={courseNames}
        allowCreate={mode === "manage"}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "manage"
                ? activeEvent
                  ? "Update session"
                  : "Add session"
                : "Session details"}
            </DialogTitle>
          </DialogHeader>

          {mode === "manage" ? (
            <ScheduleForm
              courseOptions={courseOptions}
              onSubmit={handleSubmit}
              initialValues={activeEvent ?? undefined}
              defaultDate={draftDate ? draftDate.toISOString().split("T")[0] : selectedDateKey}
              onCancel={closeDialog}
              checkConflicts={checkConflicts}
              submitting={submitting}
            />
          ) : activeEvent ? (
            <div className="space-y-4">
              <EventDetails
                event={activeEvent}
                courseName={courseNames[activeEvent.courseId]}
                teacherName={activeEvent.teacherName ?? courseTeachers[activeEvent.courseId]}
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {mode === "manage" ? (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => openCreateDialog(selectedDate)}
              disabled={courseOptions.length === 0 || loading}
            >
              Add session on {selectedDateKey}
            </Button>
            {activeEvent ? (
              <Button
                variant="ghost"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete selected session"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
