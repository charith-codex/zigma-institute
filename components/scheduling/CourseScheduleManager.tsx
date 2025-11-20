"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleEvent, useSchedules } from "@/hooks/useSchedules";
import { ScheduleCalendar } from "@/components/scheduling/ScheduleCalendar";
import { ScheduleForm, type SchedulePayload } from "@/components/scheduling/ScheduleForm";
import { ScheduleEventList } from "@/components/scheduling/ScheduleEventList";
import { Badge } from "@/components/ui/badge";

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
}

function getDayOfWeek(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleDateString(undefined, { weekday: "long" });
}

export function CourseScheduleManager({ courseOptions, heading, description }: CourseScheduleManagerProps) {
  const {
    schedules,
    addSchedule,
    updateScheduleDetails,
    deleteSchedule,
    checkConflicts,
  } = useSchedules();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const visibleSchedules = useMemo(() => {
    const allowedIds = new Set(courseOptions.map((course) => course.id));
    return schedules.filter((event) => allowedIds.has(event.courseId));
  }, [courseOptions, schedules]);

  const selectedDateKey = selectedDate.toISOString().split("T")[0];
  const eventsForSelectedDate = visibleSchedules.filter(
    (event) => event.date === selectedDateKey
  );

  const addEvent = (payload: SchedulePayload) => {
    addSchedule({
      ...payload,
      dayOfWeek: getDayOfWeek(payload.date),
    });
  };

  const updateEvent = (payload: SchedulePayload & { id: string }) => {
    updateScheduleDetails(payload.id, {
      ...payload,
      dayOfWeek: getDayOfWeek(payload.date),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{heading}</h2>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{visibleSchedules.length} scheduled sessions</Badge>
          <Badge variant="secondary">{courseOptions.length} courses available</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Create or edit sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleForm
              courseOptions={courseOptions}
              onSubmit={(payload) => addEvent(payload)}
              checkConflicts={checkConflicts}
            />
          </CardContent>
        </Card>

        <ScheduleCalendar
          events={visibleSchedules}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      <Tabs defaultValue="selected">
        <TabsList>
          <TabsTrigger value="selected">Selected Date</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="selected">
          <ScheduleEventList
            events={eventsForSelectedDate}
            heading="Sessions on selected date"
            onEdit={(event) => setEditingEvent(event)}
            onDelete={deleteSchedule}
          />
        </TabsContent>
        <TabsContent value="upcoming">
          <ScheduleEventList
            events={visibleSchedules
              .filter((event) => event.status !== "rejected")
              .sort((a, b) => a.date.localeCompare(b.date))}
            heading="All scheduled sessions"
            onEdit={(event) => setEditingEvent(event)}
            onDelete={deleteSchedule}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editingEvent)} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit schedule</DialogTitle>
          </DialogHeader>
          {editingEvent ? (
            <ScheduleForm
              courseOptions={courseOptions}
              onSubmit={(payload) => {
                updateEvent({ ...payload, id: editingEvent.id });
                setEditingEvent(null);
              }}
              initialValues={editingEvent}
              onCancel={() => setEditingEvent(null)}
              checkConflicts={checkConflicts}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
