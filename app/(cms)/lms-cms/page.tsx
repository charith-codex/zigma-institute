"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClasses } from "@/hooks/useData";
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
import { TeacherClassList } from "@/components/cms/TeacherClassList";
import { ClassContentManager } from "@/components/cms/ClassContentManager";
import { SchedulingCalendarView } from "@/components/lms/SchedulingCalendarView";
import { ScheduleLists } from "@/components/cms/ScheduleLists";
import { ScheduleForm } from "@/components/cms/ScheduleForm";
import { useParams, useRouter } from "next/navigation";
import TeacherSidebar from "@/components/cms/cms-sidebar";

const user = {
  id: "teacher-1234",
  name: "Teacher 02",
};

const LMSCMS = () => {
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();
  const { classes, loading } = useClasses();
  const [activeModule, setActiveModule] = useState(
    classId ? "exams" : "my-classes"
  );

  console.log("LMSCMS - classId from URL:", classId);
  console.log("LMSCMS - classes loading:", loading);
  console.log("LMSCMS - classes data:", classes);

  // Filter classes for the current teacher
  const teacherClasses = classes.filter((cls) => cls.teacher_id === user?.id);

  const teacherInfo = {
    name: user.name || "Teacher",
    id: user?.id?.slice(0, 8).toUpperCase() || "TEA000000",
    department: "Computer Science",
    totalStudents: teacherClasses.reduce(
      (sum, cls) => sum + (cls.enrolled_students || 0),
      0
    ),
    activeClasses: teacherClasses.length,
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-classes", label: "My Classes", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: FileText },
    { id: "exams", label: "Exams", icon: Settings },
    { id: "student-analytics", label: "Student Analytics", icon: BarChart3 },
    { id: "content-library", label: "AI Tools", icon: Library },
    { id: "schedule", label: "Schedule", icon: Calendar },
  ];

  // Handle class selection from TeacherClassList
  const handleSelectClass = (selectedClassId: string) => {
    setActiveModule("class-content");
    router.push(`/lms-cms/${selectedClassId}`);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <TeacherSidebar
        sidebarItems={menuItems}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        teacherInfo={teacherInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeModule === "dashboard" && (
                <div className="space-y-8">
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
                              Active Classes
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
                          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-success" />
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
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-accent" />
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
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-secondary" />
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
                        Ready to inspire minds today? You have{" "}
                        {teacherInfo.activeClasses} active classes with{" "}
                        {teacherInfo.totalStudents} students enrolled.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModule === "my-classes" && (
                <TeacherClassList onSelectClass={handleSelectClass} />
              )}

              {activeModule === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium">Class Schedule Update</p>
                          <p className="text-sm text-muted-foreground">
                            Mathematics class moved to 10:00 AM tomorrow
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
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

              {activeModule === "class-content" && classId && (
                <ClassContentManager
                  classId={classId}
                  classes={classes}
                  loading={loading}
                />
              )}

              {activeModule === "exams" && classId && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          Schedule Exam
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          Create and schedule new exams for your students
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => {
                            /* Add exam scheduling logic */
                          }}
                        >
                          Schedule New Exam
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-accent" />
                          Generate Papers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          Use AI to generate exam papers automatically
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            /* Add paper generation logic */
                          }}
                        >
                          Generate Paper
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-success" />
                          Quiz Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          Create and manage quizzes for quick assessments
                        </p>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => {
                            /* Add quiz management logic */
                          }}
                        >
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
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">
                              Mathematics Final Exam
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Scheduled for Dec 15, 2024
                            </p>
                          </div>
                          <Badge variant="outline">Scheduled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">Physics Quiz 3</p>
                            <p className="text-sm text-muted-foreground">
                              Completed on Dec 10, 2024
                            </p>
                          </div>
                          <Badge>Completed</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModule === "exams" && !classId && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a Class</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a class from "My Classes" to manage exams and
                    assessments.
                  </p>
                  <Button onClick={() => setActiveModule("my-classes")}>
                    Go to My Classes
                  </Button>
                </div>
              )}

              {activeModule === "student-analytics" && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Students
                            </p>
                            <p className="text-2xl font-bold">142</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Avg Performance
                            </p>
                            <p className="text-2xl font-bold">87%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Attendance Rate
                            </p>
                            <p className="text-2xl font-bold">94%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Assignments
                            </p>
                            <p className="text-2xl font-bold">24</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-muted/20">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Performance chart will be displayed here
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Class Engagement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-muted/20">
                          <div className="text-center">
                            <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Engagement metrics will be displayed here
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Performers & Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  1
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">Sarah Johnson</p>
                                <p className="text-xs text-muted-foreground">
                                  Class 12A
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-success/10 text-success">
                              96%
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-accent">
                                  2
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">Michael Chen</p>
                                <p className="text-xs text-muted-foreground">
                                  Class 12B
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-success/10 text-success">
                              94%
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-secondary">
                                  3
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">Emma Wilson</p>
                                <p className="text-xs text-muted-foreground">
                                  Class 12A
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-success/10 text-success">
                              92%
                            </Badge>
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
                          <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <div>
                              <p className="font-medium">
                                Assignment Submitted
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Mathematics homework by 15 students
                              </p>
                              <p className="text-xs text-muted-foreground">
                                2 hours ago
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                            <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                            <div>
                              <p className="font-medium">Quiz Completed</p>
                              <p className="text-sm text-muted-foreground">
                                Physics Quiz 3 by Class 12A
                              </p>
                              <p className="text-xs text-muted-foreground">
                                4 hours ago
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                            <div>
                              <p className="font-medium">
                                Low Performance Alert
                              </p>
                              <p className="text-sm text-muted-foreground">
                                3 students need attention in Chemistry
                              </p>
                              <p className="text-xs text-muted-foreground">
                                6 hours ago
                              </p>
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
                    <div className="text-center py-12">
                      <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        AI-Powered Teaching Tools
                      </h3>
                      <p className="text-muted-foreground">
                        Access AI tools to enhance your teaching and create
                        engaging content.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeModule === "schedule" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">Class Scheduling</h1>
                      <p className="text-muted-foreground">
                        Request new class sessions and manage your schedule
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <ScheduleForm
                        userType="teacher"
                        teacherId={user?.id || "teacher-default"}
                        teacherName={teacherInfo.name}
                        availableClasses={teacherClasses.map((cls) => ({
                          id: cls.id,
                          name: cls.name,
                          code: cls.code,
                        }))}
                      />
                      <ScheduleLists userType="teacher" teacherId={user?.id} />
                    </div>

                    <SchedulingCalendarView
                      userType="teacher"
                      teacherId={user?.id}
                      title="My Teaching Schedule"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LMSCMS;
