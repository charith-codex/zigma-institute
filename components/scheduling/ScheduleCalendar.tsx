"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScheduleEvent } from "@/hooks/useSchedules";

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function ScheduleCalendar({ events, selectedDate, onSelectDate }: ScheduleCalendarProps) {
  const eventDates = useMemo(
    () =>
      Array.from(
        new Set(
          events.map((event) => {
            const parsed = new Date(event.date);
            return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
          })
        )
      ),
    [events]
  );

  const modifiers = {
    busy: eventDates,
  };

  const modifiersClassNames = {
    busy: "bg-primary/20 text-primary rounded-md",
  };

  const selectedDayKey = selectedDate.toISOString().split("T")[0];
  const sessionsOnSelectedDay = events.filter(
    (event) => event.date === selectedDayKey && event.status !== "rejected"
  );

  return (
    <Card className="h-full border-border/70">
      <CardHeader>
        <CardTitle>Schedule Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectDate(date)}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="w-full"
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary/40" />
            Scheduled sessions
          </span>
          <Badge variant="outline">
            {sessionsOnSelectedDay.length} session(s) on selected date
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
