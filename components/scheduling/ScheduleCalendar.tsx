"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScheduleEvent } from "@/hooks/useSchedules";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onCreate?: (date: Date) => void;
  onEventSelect?: (event: ScheduleEvent) => void;
  courseNames?: Record<string, string>;
  allowCreate?: boolean;
}

export function ScheduleCalendar({
  events,
  selectedDate,
  onSelectDate,
  onCreate,
  onEventSelect,
  courseNames,
  allowCreate = false,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const monthLabel = format(currentMonth, "MMMM yyyy");
  const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
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
    return events.reduce<Record<string, ScheduleEvent[]>>((accumulator, event) => {
      const dayKey = event.date;
      if (!accumulator[dayKey]) {
        accumulator[dayKey] = [];
      }
      accumulator[dayKey] = [...accumulator[dayKey], event].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      return accumulator;
    }, {});
  }, [events]);

  const handleMonthChange = (delta: number) => {
    const nextMonth = addMonths(currentMonth, delta);
    setCurrentMonth(nextMonth);
  };

  const handleDayClick = (day: Date) => {
    onSelectDate(day);
    if (allowCreate && onCreate) {
      onCreate(day);
    }
  };

  return (
    <Card className="h-full border-border/70">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Schedule Calendar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tap a date to view sessions{allowCreate ? " or add a new one." : "."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[120px] text-center text-sm font-semibold">{monthLabel}</div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-muted-foreground sm:gap-3">
          {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3" role="grid">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dayKey] ?? [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => handleDayClick(day)}
                className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-2 text-left shadow-sm transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Select ${dayKey}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    } ${!isCurrentMonth ? "text-muted-foreground/60" : ""}`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="rounded-full bg-primary/10 px-2 text-[11px] font-medium text-primary">
                      {dayEvents.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-col gap-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="group flex items-center gap-2 rounded-lg bg-primary/5 px-2 py-1 text-[11px] text-left text-foreground transition hover:bg-primary/10"
                      onClick={(eventClick) => {
                        eventClick.stopPropagation();
                        onEventSelect?.(event);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(keyEvent) => {
                        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                          keyEvent.preventDefault();
                          onEventSelect?.(event);
                        }
                      }}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 truncate">
                        <p className="truncate font-medium">
                          {courseNames?.[event.courseId] ?? event.className}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {event.startTime} – {event.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 ? (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
