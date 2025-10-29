import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSchedules } from "@/hooks/useSchedules";

interface SchedulingCalendarViewProps {
  userType: 'teacher' | 'staff' | 'student';
  teacherId?: string;
  title?: string;
}

const CLASS_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200', 
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-red-100 text-red-800 border-red-200',
  'bg-orange-100 text-orange-800 border-orange-200'
];

export function SchedulingCalendarView({ userType, teacherId, title = "Class Schedule" }: SchedulingCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { getApprovedSchedules } = useSchedules();

  const approvedSchedules = getApprovedSchedules().filter(schedule => {
    if (userType === 'teacher' && teacherId) {
      return schedule.teacherId === teacherId;
    }
    return true;
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getSchedulesForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return approvedSchedules.filter(schedule => schedule.date === dateString);
  };

  const getClassColor = (classId: string) => {
    const index = parseInt(classId.slice(-1)) || 0;
    return CLASS_COLORS[index % CLASS_COLORS.length];
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const ScheduleEvent = ({ schedule }: { schedule: any }) => (
    <div className={`p-1.5 rounded-md border text-xs mb-1 ${getClassColor(schedule.classId)}`}>
      <div className="font-medium truncate">{schedule.className}</div>
      <div className="text-xs opacity-90">
        {format(new Date(`2000-01-01T${schedule.startTime}`), 'h:mm a')} - {format(new Date(`2000-01-01T${schedule.endTime}`), 'h:mm a')}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          {(userType === 'teacher' || userType === 'staff') && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              New Class
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, index) => {
            const daySchedules = getSchedulesForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`bg-white min-h-[120px] p-2 ${
                  !isCurrentMonth ? 'opacity-50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map(schedule => (
                    <ScheduleEvent key={schedule.id} schedule={schedule} />
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{daySchedules.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}