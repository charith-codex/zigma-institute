"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ScheduleEvent } from "@/hooks/useSchedules";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

interface CompactScheduleCalendarProps {
  events: ScheduleEvent[];
  className?: string;
}

export function CompactScheduleCalendar({
  events,
  className,
}: CompactScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthLabel = format(currentMonth, "MMM yyyy");
  const startDate = startOfWeek(startOfMonth(currentMonth), {
    weekStartsOn: 1,
  });
  const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

  const days = useMemo(() => {
    const dayList: Date[] = [];
    let cursor = startDate;
    while (cursor <= endDate) {
      dayList.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return dayList;
  }, [endDate, startDate]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, ScheduleEvent[]>>(
      (accumulator, event) => {
        const dayKey = event.date;
        if (!accumulator[dayKey]) {
          accumulator[dayKey] = [];
        }
        accumulator[dayKey] = [...accumulator[dayKey], event].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        return accumulator;
      },
      {}
    );
  }, [events]);

  const handleMonthChange = (delta: number) => {
    const nextMonth = addMonths(currentMonth, delta);
    setCurrentMonth(nextMonth);
  };

  const selectedDayEvents = useMemo(() => {
    const dayKey = format(selectedDate, "yyyy-MM-dd");
    return eventsByDate[dayKey] ?? [];
  }, [selectedDate, eventsByDate]);

  return (
    <Card className="border-dashed p-6">
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 pb-4">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Schedule Calendar</h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Previous month"
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="text-sm font-semibold">{monthLabel}</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Next month"
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
          {"M T W T F S S".split(" ").map((day, idx) => (
            <div key={`${day}-${idx}`} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dayKey] ?? [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors",
                  "hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  !isSelected && isToday && "border border-primary",
                  !isCurrentMonth && "text-foreground/60",
                  dayEvents.length > 0 &&
                    !isSelected &&
                    "font-semibold border-2 border-green-600"
                )}
                aria-label={`Select ${dayKey}`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {selectedDayEvents.length > 0 && (
          <div className="space-y-1.5 border-t border-border/50 pt-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {format(selectedDate, "MMM d, yyyy")}
            </p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg bg-accent/50 px-2.5 py-1.5 text-left"
                >
                  <p className="text-xs font-medium leading-tight">
                    {event.courseName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    <span>
                      {event.startTime} – {event.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
