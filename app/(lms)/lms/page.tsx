"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEnrollments, useAssignments, useCourses } from "@/hooks/useData";
import {
  BookOpen,
  Clock,
  User,
  Star,
  CheckCircle,
  TrendingUp,
  Video,
  Brain,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import { LmsSidebar } from "@/components/lms/LmsSidebar";
import TutorialManager from "@/components/lms/TutorialManager";
import { CourseDetailView } from "@/components/lms/CourseDetailView";
import { DailyQuotes } from "@/components/lms/DailyQuotes";
import { PaymentSection } from "@/components/lms/PaymentSection";
import StudyMaterialManager from "@/components/cms/StudyMaterialManager";
import VideoRecordingManager from "@/components/cms/VideoRecordingManager";
import FlashcardGenerator from "@/components/lms/FlashcardGenerator";
import SummaryGenerator from "@/components/lms/SummaryGenerator";
import StudyPlanGenerator from "@/components/lms/StudyPlanGenerator";
import { CourseScheduleManager } from "@/components/scheduling/CourseScheduleManager";
import { PublishedExams } from "@/components/lms/PublishedExams";
import CourseCard from "@/components/courses/course-card";
import { Course } from "@/types";

type EnrolledClass = Course & {
  code: string;
  instructor: string;
  progress: number;
  status: string;
  weeks: number;
  completedWeeks: number;
};

const LMS = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [selectedClass, setSelectedClass] = useState<EnrolledClass | null>(
    null
  );
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { courses } = useCourses();

  const enrolledClasses = useMemo<EnrolledClass[]>(
    () =>
      courses.map((course) => ({
        ...course,
        code: course.slug?.toUpperCase() ?? course.id.slice(0, 8).toUpperCase(),
        instructor: course.teacherName ?? "Instructor",
        progress: 0,
        status: "active",
        weeks: 0,
        completedWeeks: 0,
      })),
    [courses]
  );

  const scheduleCourseOptions = useMemo(
    () =>
      courses.map((course) => ({
        id: course.id,
        name: course.name,
        teacherId: course.teacherId ?? `${course.id}-teacher`,
        teacherName: course.teacherName ?? "Instructor",
      })),
    [courses]
  );

  return (
    <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <LmsSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col rounded-2xl border border-border bg-background shadow-sm">
          <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
            {activeModule === "dashboard" && (
              <div className="space-y-8">
                {/* Daily Motivation */}
                <DailyQuotes />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Enrolled Courses
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
                <CourseDetailView
                  classData={selectedClass}
                  onBack={() => setSelectedClass(null)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">My Courses</h1>
                      <p className="text-muted-foreground">
                        Track your progress across all enrolled courses
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {enrolledClasses.map((classItem) => (
                      <CourseCard
                        key={classItem.id}
                        course={classItem}
                        showPrice={false}
                        showDescription
                        href={`/lms/courses/${classItem.slug}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setSelectedClass(classItem);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}

            {activeModule === "exams" && (
              <PublishedExams
                heading="Exams"
                description="Browse available exams and start a session when you're ready."
              />
            )}

            {activeModule === "schedule" && (
              <CourseScheduleManager
                courseOptions={scheduleCourseOptions}
                heading="My Course Schedule"
                description="Check upcoming classes on a responsive calendar."
                mode="view"
              />
            )}

            {activeModule === "study-tools" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">AI Study Tools</h1>
                  <p className="text-muted-foreground mb-6">
                    Use AI-powered tools to enhance your learning experience
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <FlashcardGenerator />
                  <SummaryGenerator />
                </div>

                <StudyPlanGenerator />

                <div className="border-t pt-6 mt-6">
                  <TutorialManager />
                </div>
              </div>
            )}

            {activeModule === "performance" && (
              <div className="space-y-8">
                {/* Performance Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      Academic Performance
                    </h1>
                    <p className="text-muted-foreground">
                      Track your progress, achievements, and learning milestones
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-white shadow-soft sm:flex-row sm:items-center sm:gap-3">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Honor Student</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="edu-card-hover border-primary/20">
                    <CardContent className="p-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-success to-success-light flex items-center justify-center">
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
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
                          className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-card p-4 transition-all hover-lift sm:flex-row sm:items-center sm:justify-between"
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
                      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-linear-to-r from-primary-light to-transparent p-4 animate-scale-in sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
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

                      <div className="flex flex-col gap-4 rounded-xl border border-success/20 bg-linear-to-r from-success-light to-transparent p-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success">
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

                      <div className="flex flex-col gap-4 rounded-xl border border-accent/20 bg-linear-to-r from-accent-light to-transparent p-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent">
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
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
                                className="flex flex-wrap items-center gap-3 sm:gap-4"
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
                      <div className="mt-6 rounded-xl border border-border bg-gradient-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
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
                        <div className="rounded-lg border border-success/20 bg-success-light p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-success">
                              Complete CS101
                            </span>
                            <CheckCircle className="w-4 h-4 text-success" />
                          </div>
                          <Progress value={90} className="h-2" />
                        </div>

                        <div className="rounded-lg border border-warning/20 bg-warning-light p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-warning">
                              Improve Math Grade
                            </span>
                            <Clock className="w-4 h-4 text-warning" />
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>

                        <div className="rounded-lg border border-primary/20 bg-primary-light p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
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
