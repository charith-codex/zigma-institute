"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEnrollments, useAssignments, usePayments } from "@/hooks/useData";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Bell,
  Star,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Download,
  FileText,
  Video,
  Headphones,
  Brain,
  Target,
  Award,
  GraduationCap,
  DollarSign,
  LogOut,
  BookMarked,
  NotebookPen,
  Menu,
  Home,
  CreditCard,
  Settings,
  BarChart3,
} from "lucide-react";
import { StudentSidebar } from "@/components/lms/StudentSidebar";
import TutorialManager from "@/components/lms/TutorialManager";
import { ClassDetailView } from "@/components/lms/ClassDetailView";
import { signOut } from "@/auth";
import { DailyQuotes } from "@/components/lms/DailyQuotes";
import { SchedulingCalendarView } from "@/components/lms/SchedulingCalendarView";
import { PaymentSection } from "@/components/lms/PaymentSection";

const LMS = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { payments, loading: paymentsLoading } = usePayments();

  // const studentInfo = {
  //   name: userProfile?.full_name || "Student",
  //   id: User.
  //   program: "Computer Science",
  //   semester: "Current Semester",
  //   gpa: "N/A",
  //   completedCourses: enrollments.filter((e) => e.status === "completed")
  //     .length,
  //   totalCourses: enrollments.length,
  // };

  // Hardcoded enrolled classes for the student
  const enrolledClasses = [
    {
      id: "cs101",
      code: "CS101",
      name: "Computer Science Fundamentals",
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      status: "active",
      weeks: 12,
      completedWeeks: 9,
    },
    {
      id: "math201",
      code: "MATH201",
      name: "Advanced Mathematics",
      instructor: "Prof. Michael Chen",
      progress: 60,
      status: "active",
      weeks: 14,
      completedWeeks: 8,
    },
    {
      id: "phys301",
      code: "PHYS301",
      name: "Physics for Engineers",
      instructor: "Dr. Emma Wilson",
      progress: 45,
      status: "active",
      weeks: 16,
      completedWeeks: 7,
    },
    {
      id: "cs205",
      code: "CS205",
      name: "Database Systems",
      instructor: "Prof. David Rodriguez",
      progress: 90,
      status: "active",
      weeks: 12,
      completedWeeks: 11,
    },
  ];

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <StudentSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      {/* Main Content */}
      <main className="flex-1 pt-14 p-6 bg-muted/20">
        <div className="h-full bg-background rounded-lg shadow-sm border border-border overflow-auto">
          <div className="p-6">
            {activeModule === "dashboard" && (
              <div className="space-y-8">
                {/* Daily Motivation */}
                <DailyQuotes />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Enrolled Classes
                          </p>
                          {/* <p className="text-xl font-bold">
                              {studentInfo.totalCourses}
                            </p> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Completed
                          </p>
                          {/* <p className="text-xl font-bold">
                              {studentInfo.completedCourses}
                            </p> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Average Grade
                          </p>
                          {/* <p className="text-xl font-bold">
                              {studentInfo.gpa}
                            </p> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Hours Watched
                          </p>
                          <p className="text-xl font-bold">47h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Welcome Message */}
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Your learning journey continues. You have{" "}
                      {assignments.length} assignments to review.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeModule === "classes" &&
              (selectedClass ? (
                <ClassDetailView
                  classData={selectedClass}
                  onBack={() => setSelectedClass(null)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">My Classes</h1>
                      <p className="text-muted-foreground">
                        Track your progress across all enrolled courses
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledClasses.map((classItem) => (
                      <Card
                        key={classItem.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {classItem.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {classItem.code}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {classItem.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{classItem.instructor}</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{classItem.progress}%</span>
                            </div>
                            <Progress
                              value={classItem.progress}
                              className="h-2"
                            />
                          </div>

                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              {classItem.completedWeeks} of {classItem.weeks}{" "}
                              weeks completed
                            </span>
                          </div>

                          <Button
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => setSelectedClass(classItem)}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Class Content
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

            {activeModule === "schedule" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">My Class Schedule</h1>
                    <p className="text-muted-foreground">
                      View your upcoming classes and sessions
                    </p>
                  </div>
                </div>

                <SchedulingCalendarView
                  userType="student"
                  title="Your Class Schedule"
                />
              </div>
            )}

            {activeModule === "study-tools" && <TutorialManager />}

            {activeModule === "performance" && (
              <div className="space-y-8">
                {/* Performance Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      Academic Performance
                    </h1>
                    <p className="text-muted-foreground">
                      Track your progress, achievements, and learning milestones
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-primary rounded-xl text-white shadow-soft">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Honor Student</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="edu-card-hover border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-success-light text-success border-success/20">
                          Excellent
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          3.85
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current GPA
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-xs text-success">
                            +0.15 from last semester
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="edu-card-hover border-secondary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-warning-light text-warning border-warning/20">
                          On Track
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          87%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Assignment Completion
                        </p>
                        <div className="w-full bg-secondary-light rounded-full h-2 mt-3">
                          <div
                            className="bg-secondary h-2 rounded-full"
                            style={{ width: "87%" }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="edu-card-hover border-accent/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-primary-light text-primary border-primary/20">
                          Active
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">23</p>
                        <p className="text-sm text-muted-foreground">
                          Study Streak (Days)
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span className="text-xs text-accent">
                            Personal best!
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="edu-card-hover border-success/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success-light flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-accent-light text-accent border-accent/20">
                          New!
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">12</p>
                        <p className="text-sm text-muted-foreground">
                          Achievements Unlocked
                        </p>
                        <div className="flex -space-x-1 mt-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-primary border-2 border-white"></div>
                          <div className="w-5 h-5 rounded-full bg-gradient-secondary border-2 border-white"></div>
                          <div className="w-5 h-5 rounded-full bg-gradient-accent border-2 border-white"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Course Performance Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Course Progress */}
                  <Card className="edu-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Course Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enrolledClasses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-card border border-border hover-lift"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {course.code.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {course.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-lg font-bold text-foreground">
                                  {course.progress}%
                                </p>
                                <Progress
                                  value={course.progress}
                                  className="w-16 h-2"
                                />
                              </div>
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  course.progress >= 80
                                    ? "bg-success"
                                    : course.progress >= 60
                                    ? "bg-warning"
                                    : "bg-destructive"
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Achievements */}
                  <Card className="edu-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-accent" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-light to-transparent border border-primary/20 animate-scale-in">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Perfect Attendance
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Attended all classes this month
                          </p>
                          <p className="text-xs text-primary font-medium">
                            Earned 2 days ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-success-light to-transparent border border-success/20">
                        <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Grade Improvement
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Mathematics grade increased by 15%
                          </p>
                          <p className="text-xs text-success font-medium">
                            Earned 1 week ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-accent-light to-transparent border border-accent/20">
                        <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Study Champion
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Completed 20+ hours this week
                          </p>
                          <p className="text-xs text-accent font-medium">
                            Earned 3 days ago
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Study Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 edu-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Weekly Study Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day, index) => {
                            const hours = [3.5, 4.2, 2.8, 5.1, 3.9, 6.2, 4.8][
                              index
                            ];
                            return (
                              <div
                                key={day}
                                className="flex items-center gap-4"
                              >
                                <span className="w-8 text-sm font-medium text-muted-foreground">
                                  {day}
                                </span>
                                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${(hours / 7) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="w-12 text-sm font-medium text-foreground text-right">
                                  {hours}h
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                      <div className="mt-6 p-4 bg-gradient-card rounded-xl border border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              This Week Total
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                              30.5 hours
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Goal: 25h
                            </p>
                            <p className="text-sm font-medium text-success">
                              122% Complete
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="edu-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-secondary" />
                        Learning Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-success-light border border-success/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-success">
                              Complete CS101
                            </span>
                            <CheckCircle className="w-4 h-4 text-success" />
                          </div>
                          <Progress value={90} className="h-2" />
                        </div>

                        <div className="p-3 rounded-lg bg-warning-light border border-warning/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-warning">
                              Improve Math Grade
                            </span>
                            <Clock className="w-4 h-4 text-warning" />
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>

                        <div className="p-3 rounded-lg bg-primary-light border border-primary/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary">
                              Physics Mastery
                            </span>
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeModule === "payments" && <PaymentSection />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LMS;
