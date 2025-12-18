"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClasses } from "@/hooks/useData";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  Settings,
  Home,
  BookOpen,
  Users,
  BarChart3,
  Library,
  Calendar,
  FileText,
} from "lucide-react";
import { TeacherCourseList } from "@/components/cms/TeacherCourseList";
import { CourseContentManager } from "@/components/cms/CourseContentManager";
import { useParams, useRouter } from "next/navigation";

import { useSession } from "next-auth/react";
import { CourseScheduleManager } from "@/components/scheduling/CourseScheduleManager";
import CmsSidebar from "@/components/cms/CmsSidebar";

const LMSCMS = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { classes, loading } = useClasses();
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role ?? null;
  const isAdmin = role === "ADMIN";
  const isTeacher = role === "TEACHER";

  const accessibleClasses = useMemo(() => {
    if (isAdmin) {
      return classes;
    }

    if (isTeacher && userId) {
      return classes.filter((cls) => cls.teacher_id === userId);
    }

    return [];
  }, [classes, isAdmin, isTeacher, userId]);

  const classIsAccessible = useMemo(() => {
    if (!courseId) {
      return true;
    }

    return accessibleClasses.some((cls) => cls.id === courseId);
  }, [accessibleClasses, courseId]);

  const [activeModule, setActiveModule] = useState(
    courseId && classIsAccessible ? "class-content" : "my-classes"
  );

  useEffect(() => {
    if (courseId && classIsAccessible) {
      setActiveModule("class-content");
    } else if (courseId && !classIsAccessible) {
      setActiveModule("my-classes");
    }
  }, [courseId, classIsAccessible]);

  // Filter classes for the current teacher
  const teacherClasses = accessibleClasses;

  const scheduleCourseOptions = useMemo(
    () =>
      teacherClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        teacherId: cls.teacher_id ?? `${cls.id}-teacher`,
        teacherName: cls.teacher_name ?? "Instructor",
      })),
    [teacherClasses]
  );

  const teacherInfo = {
    name: session?.user?.name || "Teacher",
    id: userId ? userId.slice(0, 8).toUpperCase() : "TEA000000",
    department: isAdmin ? "Administration" : "Computer Science",
    totalStudents: teacherClasses.reduce(
      (sum, cls) => sum + (cls.enrolled_students || 0),
      0
    ),
    activeClasses: teacherClasses.length,
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-classes", label: "My Courses", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: FileText },
    { id: "exams", label: "Exams", icon: Settings },
    { id: "student-analytics", label: "Student Analytics", icon: BarChart3 },
    { id: "content-library", label: "AI Tools", icon: Library },
    { id: "schedule", label: "Schedule", icon: Calendar },
  ];

  // Handle class selection from TeacherCourseList
  const handleSelectClass = (selectedCourseId: string) => {
    setActiveModule("class-content");
    router.push(`/lms-cms/${selectedCourseId}`);
  };

  const isAuthenticated = Boolean(session?.user);
  const combinedLoading = loading || sessionLoading;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full bg-muted/20">
      <CmsSidebar
        items={menuItems}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col rounded-2xl border border-border/60 bg-background shadow-sm">
          <div className="flex-1 overflow-hidden">
            {combinedLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <h2 className="text-xl font-semibold">
                    Please sign in to manage your courses
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Access to the LMS CMS is restricted to authorized users.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 p-4 sm:p-6 lg:p-8">
                {activeModule === "dashboard" && (
                  <div className="space-y-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Active Courses
                              </p>
                              <p className="text-xl font-bold">
                                {teacherInfo.activeClasses}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                              <Users className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Total Students
                              </p>
                              <p className="text-xl font-bold">
                                {teacherInfo.totalStudents}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                              <BarChart3 className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Completion Rate
                              </p>
                              <p className="text-xl font-bold">87%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                              <FileText className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Content Items
                              </p>
                              <p className="text-xl font-bold">156</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Welcome Message */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Welcome back, {teacherInfo.name}!</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Ready to inspire minds today? You have {teacherInfo.activeClasses} active
                          classes with {teacherInfo.totalStudents} students enrolled.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeModule === "my-classes" && (
                  <TeacherCourseList
                    onSelectClass={handleSelectClass}
                    classes={teacherClasses}
                    loading={combinedLoading}
                  />
                )}

                {activeModule === "notifications" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <div>
                            <p className="font-medium">Course Schedule Update</p>
                            <p className="text-sm text-muted-foreground">
                              Mathematics class moved to 10:00 AM tomorrow
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                          <div className="h-2 w-2 rounded-full bg-accent" />
                          <div>
                            <p className="font-medium">Assignment Submitted</p>
                            <p className="text-sm text-muted-foreground">
                              New submission for Physics homework
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeModule === "class-content" && courseId && classIsAccessible && (
                  <CourseContentManager
                    courseId={courseId}
                    classes={teacherClasses}
                    loading={combinedLoading}
                  />
                )}

                {activeModule === "class-content" && courseId && !classIsAccessible && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Course access required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        You do not have permission to manage this course. Please select a course
                        assigned to you from the list.
                      </p>
                      <Button className="mt-4" variant="outline" onClick={() => router.push("/lms-cms")}>
                        Back to my courses
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {activeModule === "exams" && courseId && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <Card className="transition-shadow hover:shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Schedule Exam
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-muted-foreground">
                            Create and schedule new exams for your students
                          </p>
                          <Button className="w-full">Schedule New Exam</Button>
                        </CardContent>
                      </Card>

                      <Card className="transition-shadow hover:shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-accent" />
                            Generate Papers
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-muted-foreground">
                            Use AI to generate exam papers automatically
                          </p>
                          <Button variant="outline" className="w-full">
                            Generate Paper
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="transition-shadow hover:shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-success" />
                            Quiz Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-muted-foreground">
                            Create and manage quizzes for quick assessments
                          </p>
                          <Button variant="secondary" className="w-full">
                            Manage Quizzes
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Exams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div>
                              <p className="font-medium">Mathematics Final Exam</p>
                              <p className="text-sm text-muted-foreground">Scheduled for Dec 15, 2024</p>
                            </div>
                            <Badge variant="outline">Scheduled</Badge>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div>
                              <p className="font-medium">Physics Quiz 3</p>
                              <p className="text-sm text-muted-foreground">Completed on Dec 10, 2024</p>
                            </div>
                            <Badge>Completed</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeModule === "exams" && !courseId && (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">Select a Course</h3>
                    <p className="mb-4 text-muted-foreground">
                      Choose a class from My Courses to manage exams and assessments.
                    </p>
                    <Button onClick={() => setActiveModule("my-classes")}>
                      Go to My Courses
                    </Button>
                  </div>
                )}

                {activeModule === "student-analytics" && (
                  <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Students</p>
                              <p className="text-2xl font-bold">142</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                              <BarChart3 className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Avg Performance</p>
                              <p className="text-2xl font-bold">87%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                              <Calendar className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Attendance Rate</p>
                              <p className="text-2xl font-bold">94%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                              <BookOpen className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Assignments</p>
                              <p className="text-2xl font-bold">24</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/20">
                            <div className="text-center">
                              <BarChart3 className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Performance chart will be displayed here
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Course Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/20">
                            <div className="text-center">
                              <Users className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Engagement metrics will be displayed here
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Performers & Recent Activity */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Performers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary">
                                  <span className="text-xs font-bold text-white">1</span>
                                </div>
                                <div>
                                  <p className="font-medium">Sarah Johnson</p>
                                  <p className="text-xs text-muted-foreground">Course 12A</p>
                                </div>
                              </div>
                              <Badge className="bg-success/10 text-success">96%</Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                                  <span className="text-xs font-bold text-accent">2</span>
                                </div>
                                <div>
                                  <p className="font-medium">Michael Chen</p>
                                  <p className="text-xs text-muted-foreground">Course 12B</p>
                                </div>
                              </div>
                              <Badge className="bg-success/10 text-success">94%</Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
                                  <span className="text-xs font-bold text-secondary">3</span>
                                </div>
                                <div>
                                  <p className="font-medium">Emma Wilson</p>
                                  <p className="text-xs text-muted-foreground">Course 12A</p>
                                </div>
                              </div>
                              <Badge className="bg-success/10 text-success">92%</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                              <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                              <div>
                                <p className="font-medium">Assignment Submitted</p>
                                <p className="text-sm text-muted-foreground">
                                  Mathematics homework by 15 students
                                </p>
                                <p className="text-xs text-muted-foreground">2 hours ago</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                              <div className="mt-2 h-2 w-2 rounded-full bg-success" />
                              <div>
                                <p className="font-medium">Quiz Completed</p>
                                <p className="text-sm text-muted-foreground">
                                  Physics Quiz 3 by Course 12A
                                </p>
                                <p className="text-xs text-muted-foreground">4 hours ago</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                              <div className="mt-2 h-2 w-2 rounded-full bg-accent" />
                              <div>
                                <p className="font-medium">Low Performance Alert</p>
                                <p className="text-sm text-muted-foreground">
                                  3 students need attention in Chemistry
                                </p>
                                <p className="text-xs text-muted-foreground">6 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeModule === "content-library" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="py-12 text-center">
                        <Library className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">AI-Powered Teaching Tools</h3>
                        <p className="text-muted-foreground">
                          Access AI tools to enhance your teaching and create engaging content.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeModule === "schedule" && (
                  <CourseScheduleManager
                    courseOptions={scheduleCourseOptions}
                    heading="Course Scheduling"
                    description="View course sessions on a large, responsive calendar."
                    mode="view"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LMSCMS;
