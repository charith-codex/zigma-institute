"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleEvent } from "@/hooks/useSchedules";
import {
  CalendarClock,
  Clock,
  Edit2,
  MapPin,
  Trash2,
  User,
} from "lucide-react";

interface ScheduleEventListProps {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: string) => void;
  heading?: string;
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

export function ScheduleEventList({
  events,
  onEdit,
  onDelete,
  heading,
}: ScheduleEventListProps) {
  if (events.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{heading ?? "No sessions scheduled"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add a session to see it appear here on the selected date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {heading ? <h3 className="text-lg font-semibold">{heading}</h3> : null}
      {events.map((event) => (
        <Card key={event.id} className="border-border/70">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" /> {event.dayOfWeek}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />{" "}
                  {formatTimeRange(event.startTime, event.endTime)}
                </span>
                {event.teacherName ? (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4" /> {event.teacherName}
                  </span>
                ) : null}
                {event.notes ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {event.notes}
                  </span>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
