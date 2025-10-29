import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSchedules, ScheduleEvent } from "@/hooks/useSchedules";

interface ScheduleFormProps {
  userType: 'teacher' | 'staff';
  teacherId: string;
  teacherName: string;
  availableClasses: Array<{ id: string; name: string; code: string }>;
  onSuccess?: () => void;
}

export function ScheduleForm({ userType, teacherId, teacherName, availableClasses, onSuccess }: ScheduleFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [classId, setClassId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addSchedule, checkConflicts } = useSchedules();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !classId || !startTime || !endTime) return;

    setIsSubmitting(true);

    const selectedClass = availableClasses.find(c => c.id === classId);
    if (!selectedClass) return;

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeek = format(selectedDate, "EEEE");

    // Check for conflicts
    const conflicts = checkConflicts(dateString, startTime, endTime);
    if (conflicts.hasConflict) {
      // Still allow submission but warn user
      console.warn("Scheduling conflict detected:", conflicts.conflictingEvents);
    }

    const scheduleData: Omit<ScheduleEvent, 'id' | 'createdAt'> = {
      classId,
      className: selectedClass.name,
      date: dateString,
      startTime,
      endTime,
      dayOfWeek,
      status: userType === 'teacher' ? 'pending_staff_approval' : 'pending_teacher_confirmation',
      createdBy: userType,
      teacherId,
      teacherName,
      notes: notes || undefined,
      recurring
    };

    addSchedule(scheduleData);

    // Reset form
    setSelectedDate(undefined);
    setClassId("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    setRecurring(false);
    setIsSubmitting(false);

    onSuccess?.();
  };

  const conflicts = selectedDate && startTime && endTime 
    ? checkConflicts(format(selectedDate, "yyyy-MM-dd"), startTime, endTime)
    : { hasConflict: false, conflictingEvents: [] };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Schedule Class Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-select">Class</Label>
              <Select value={classId} onValueChange={setClassId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {conflicts.hasConflict && (
            <div className="p-3 bg-warning-light border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 text-warning mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule Conflict Detected</span>
              </div>
              <div className="text-sm text-warning">
                {conflicts.conflictingEvents.map(event => (
                  <p key={event.id}>
                    {event.className} is already scheduled from {event.startTime} - {event.endTime}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recurring" 
              checked={recurring}
              onCheckedChange={(checked) => setRecurring(checked as boolean)}
            />
            <Label htmlFor="recurring" className="text-sm">
              Make this a recurring session (weekly)
            </Label>
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !selectedDate || !classId || !startTime || !endTime}
            >
              {isSubmitting ? "Scheduling..." : `Submit for ${userType === 'teacher' ? 'Staff Approval' : 'Teacher Confirmation'}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}