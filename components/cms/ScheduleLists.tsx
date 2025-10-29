import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, Calendar, User } from "lucide-react";
import { useSchedules, ScheduleEvent } from "@/hooks/useSchedules";

interface ScheduleListsProps {
  userType: 'teacher' | 'staff';
  teacherId?: string;
}

export function ScheduleLists({ userType, teacherId }: ScheduleListsProps) {
  const { schedules, updateScheduleStatus, deleteSchedule } = useSchedules();

  const pendingSchedules = schedules.filter(schedule => {
    if (userType === 'staff') {
      return schedule.status === 'pending_staff_approval';
    } else {
      return schedule.status === 'pending_teacher_confirmation' && schedule.teacherId === teacherId;
    }
  });

  const approvedSchedules = schedules.filter(schedule => {
    if (schedule.status !== 'approved') return false;
    if (userType === 'teacher') {
      return schedule.teacherId === teacherId;
    }
    return true;
  });

  const handleApprove = (scheduleId: string) => {
    updateScheduleStatus(scheduleId, 'approved');
  };

  const handleReject = (scheduleId: string) => {
    updateScheduleStatus(scheduleId, 'rejected');
  };

  const getStatusBadge = (status: ScheduleEvent['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success-light text-success">Approved</Badge>;
      case 'pending_staff_approval':
        return <Badge variant="outline" className="text-warning">Pending Staff Approval</Badge>;
      case 'pending_teacher_confirmation':
        return <Badge variant="outline" className="text-warning">Pending Teacher Confirmation</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  const ScheduleCard = ({ schedule }: { schedule: ScheduleEvent }) => (
    <div key={schedule.id} className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{schedule.className}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(schedule.date), "MMM d, yyyy")} ({schedule.dayOfWeek})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{schedule.startTime} - {schedule.endTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <User className="w-3 h-3" />
            <span>{schedule.teacherName}</span>
          </div>
        </div>
        {getStatusBadge(schedule.status)}
      </div>
      
      {schedule.notes && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
          {schedule.notes}
        </p>
      )}

      {schedule.recurring && (
        <Badge variant="secondary" className="text-xs">Recurring Weekly</Badge>
      )}

      {schedule.status.includes('pending') && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => handleApprove(schedule.id)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {userType === 'staff' ? 'Approve' : 'Confirm'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleReject(schedule.id)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {pendingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Pending {userType === 'staff' ? 'Approvals' : 'Confirmations'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingSchedules.map(schedule => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {userType === 'staff' ? 'All Approved Schedules' : 'My Approved Schedules'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedSchedules.length > 0 ? (
            <div className="space-y-4">
              {approvedSchedules.map(schedule => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No approved schedules yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}