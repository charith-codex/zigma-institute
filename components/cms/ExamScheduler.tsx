import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  Clock,
  Users,
  Play,
  Square,
  Eye,
  FileText,
  Settings,
  CheckCircle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExamSession {
  id: string;
  title: string;
  examPaperId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  maxAttempts: number;
  status: "scheduled" | "active" | "completed" | "cancelled";
  enrolledStudents: number;
  submittedCount: number;
  instructions: string;
  allowLateSubmission: boolean;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
}

export function ExamScheduler({ courseId }: { courseId: string }) {
  const [activeTab, setActiveTab] = useState("scheduled");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [examSessions] = useState<ExamSession[]>([
    {
      id: "session-001",
      title: "Midterm Examination - React Fundamentals",
      examPaperId: "paper-001",
      date: "2024-01-25",
      startTime: "10:00",
      endTime: "12:00",
      duration: 120,
      maxAttempts: 1,
      status: "scheduled",
      enrolledStudents: 28,
      submittedCount: 0,
      instructions: "Please read all instructions carefully before starting.",
      allowLateSubmission: false,
      shuffleQuestions: true,
      showResultsImmediately: false,
    },
    {
      id: "session-002",
      title: "Final Examination - Full Stack Development",
      examPaperId: "paper-002",
      date: "2024-01-30",
      startTime: "14:00",
      endTime: "17:00",
      duration: 180,
      maxAttempts: 1,
      status: "active",
      enrolledStudents: 28,
      submittedCount: 15,
      instructions: "Comprehensive exam covering all course topics.",
      allowLateSubmission: true,
      shuffleQuestions: true,
      showResultsImmediately: false,
    },
  ]);

  const handleScheduleExam = () => {
    toast.success("Exam scheduled successfully!");
    setScheduleDialogOpen(false);
  };

  const startExamSession = (sessionId: string) => {
    toast.success("Exam session started! Students can now access the exam.");
  };

  const endExamSession = (sessionId: string) => {
    toast.success("Exam session ended. All submissions collected.");
  };

  const getStatusColor = (status: ExamSession["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-primary/10 text-primary border-primary/20";
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "completed":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Exam Sessions</h2>
          <p className="text-muted-foreground">
            Schedule and monitor exam sessions
          </p>
        </div>
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-medium">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Exam Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exam-title">Exam Title</Label>
                <Input
                  id="exam-title"
                  placeholder="Enter exam title"
                  className="border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-paper">Select Exam Paper</Label>
                <Select>
                  <SelectTrigger className="border-border/50">
                    <SelectValue placeholder="Choose exam paper" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper-001">
                      Midterm - React Fundamentals
                    </SelectItem>
                    <SelectItem value="paper-002">
                      Final - Full Stack Development
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Exam Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-border/50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="120"
                    className="border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Enter exam instructions"
                  className="border-border/50 focus:border-primary"
                />
              </div>

              <Button
                onClick={handleScheduleExam}
                className="w-full bg-gradient-primary"
              >
                Schedule Exam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scheduled">Scheduled Exams</TabsTrigger>
          <TabsTrigger value="completed">Completed Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid gap-4">
            {examSessions
              .filter(
                (session) =>
                  session.status === "scheduled" || session.status === "active"
              )
              .map((session) => (
                <Card key={session.id} className="edu-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.startTime} - {session.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.enrolledStudents} students
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Duration: {session.duration} minutes • Max attempts:{" "}
                        {session.maxAttempts}
                        {session.status === "active" && (
                          <span className="ml-4 text-success">
                            {session.submittedCount}/{session.enrolledStudents}{" "}
                            submitted
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {session.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => startExamSession(session.id)}
                            className="bg-success hover:bg-success-hover text-success-foreground"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {session.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => endExamSession(session.id)}
                            >
                              <Square className="w-4 h-4 mr-1" />
                              End
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {examSessions
              .filter((session) => session.status === "completed")
              .map((session) => (
                <Card key={session.id} className="edu-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-success" />
                            {session.submittedCount}/{session.enrolledStudents}{" "}
                            completed
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Completion rate:{" "}
                        {Math.round(
                          (session.submittedCount / session.enrolledStudents) *
                            100
                        )}
                        %
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {examSessions.filter((session) => session.status === "completed")
            .length === 0 && (
            <Card className="edu-card">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No Completed Exams
                </h3>
                <p className="text-muted-foreground">
                  Completed exam sessions will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
