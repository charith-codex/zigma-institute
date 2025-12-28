"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Plus,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  GraduationCap,
  BarChart3,
  UserCheck,
} from "lucide-react";
import {
  DashboardSidebar,
  getMenuEntriesForRole,
} from "@/components/eims/DashboardSidebar";
import { cn } from "@/lib/utils";
import { useDashboardStats, useCourses } from "@/hooks/useData";

// Module Imports
import { PhysicalMaterialDistribution } from "@/components/eims/PhysicalMaterialDistribution";
import { Notifications } from "@/components/eims/Notifications";
import FeeManagement from "@/components/eims/FeeManagement";
import AttendanceQR from "@/components/eims/AttendanceQR";
import { StaffManagement } from "@/components/eims/manage-users/StaffManagement";
import { InquiryManagement } from "@/components/eims/InquiryManagement";
import { TeacherManagement } from "@/components/eims/manage-users/TeacherManagement";
import { CourseManagement } from "@/components/eims/CourseManagement";
import { ShowcaseManagement } from "@/components/eims/ShowcaseManagement";
import { StudentManagement } from "@/components/eims/manage-users/StudentManagement";
import { CourseScheduleManager } from "@/components/scheduling/CourseScheduleManager";
import { CourseCategoryManagement } from "@/components/eims/CourseCategoryManagement";
import { CourseAccessControl } from "@/components/eims/CourseAccessControl";
import { DuePayments } from "@/components/eims/DuePayments";

type SessionLike = {
  user?: {
    name?: string | null;
    role?: string | null;
    email?: string | null;
  } | null;
} | null;

interface DashboardContentProps {
  session: SessionLike;
}

export function DashboardContent({ session }: DashboardContentProps) {
  const [activeModule, setActiveModule] = useState("overview");
  const userRole = session?.user?.role ?? null;

  const { stats, loading: statsLoading } = useDashboardStats();
  const { courses } = useCourses();

  const isAdmin = userRole === "ADMIN" || userRole === "it_admin";
  const isManager = userRole === "MANAGER" || userRole === "management_staff";
  const isAttendance = userRole === "ATTENDANCE";

  const canManageStudents = isAdmin || isManager;
  const canManageStaff = isAdmin;

  const scheduleCourseOptions = useMemo(
    () =>
      courses.map((course) => ({
        id: course.id,
        name: course.name,
        teacherId: course.teacherId ?? `${course.id}-teacher`,
        teacherName: course.teacherName ?? "Teacher",
      })),
    [courses]
  );

  const statStyles = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary-foreground",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
  } as const;

  const dashboardStats = useMemo(
    () =>
      [
        {
          title: "Total Students",
          value: statsLoading ? "..." : stats.studentCount?.toString() || "0",
          change: "+12%",
          icon: Users,
          color: "primary",
        },
        {
          title: "Active Teachers",
          value: statsLoading ? "..." : stats.teacherCount?.toString() || "0",
          change: "+3%",
          icon: GraduationCap,
          color: "secondary",
        },
        {
          title: "Total Revenue",
          value: statsLoading
            ? "..."
            : `$${stats.totalRevenue?.toLocaleString() || "0"}`,
          change: "+8%",
          icon: DollarSign,
          color: "accent",
          hidden: isAttendance,
        },
        {
          title: "Active Courses",
          value: statsLoading ? "..." : courses.length.toString(),
          change: "+5%",
          icon: BookOpen,
          color: "success",
        },
      ].filter((s) => !("hidden" in s) || !s.hidden),
    [stats, statsLoading, courses, isAttendance]
  );

  const recentActivities = [
    {
      id: 1,
      type: "enrollment",
      message: "New student enrolled in Computer Science",
      time: "2 hours ago",
      icon: UserCheck,
    },
    {
      id: 2,
      type: "payment",
      message: "Fee payment received from John Doe",
      time: "3 hours ago",
      icon: DollarSign,
    },
    {
      id: 3,
      type: "course",
      message: "New course 'AI Fundamentals' published",
      time: "5 hours ago",
      icon: BookOpen,
    },
    {
      id: 4,
      type: "assignment",
      message: "Assignment submitted by Sarah Wilson",
      time: "6 hours ago",
      icon: FileText,
    },
  ];

  const quickActions = [
    { title: "Create Course", icon: BookOpen, action: "create-course" },
    { title: "Schedule Course", icon: Calendar, action: "schedule-course" },
    { title: "Generate Report", icon: BarChart3, action: "generate-report" },
  ];

  const menuEntries = useMemo(
    () => getMenuEntriesForRole(userRole),
    [userRole]
  );

  const allowedModules = useMemo(() => {
    const modules = new Set<string>(["overview"]);

    menuEntries.forEach((entry) => {
      if (entry.items && entry.items.length > 0) {
        entry.items.forEach((item) => modules.add(item.id));
      } else {
        modules.add(entry.id);
      }
    });

    return modules;
  }, [menuEntries]);

  useEffect(() => {
    if (!allowedModules.has(activeModule)) {
      setActiveModule("overview");
    }
  }, [activeModule, allowedModules]);

  const renderOverview = () => (
    <div className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Role: {session?.user?.role?.replace("_", " ").toUpperCase()}
        </p>
      </div>

      {/* Stats and Activity Sections */}
      <div className="space-y-6 sm:space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {dashboardStats.map((stat: any, index: number) => (
            <Card key={index} className="edu-card-hover h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    statStyles[stat.color as keyof typeof statStyles]
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change} from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {/* Quick Actions - Hidden for Attendance Staff */}
          {!isAttendance && (
            <Card className="md:col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 w-full justify-start gap-3 rounded-xl border-border/70 text-left text-sm font-medium"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Activities */}
          <Card
            className={cn(
              "md:col-span-1",
              isAttendance ? "lg:col-span-3" : "lg:col-span-2"
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <activity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    const isUserManagementRestricted =
      (activeModule === "staff-management" && !canManageStaff) ||
      ((activeModule === "students" || activeModule === "teachers") &&
        !canManageStudents);

    if (isUserManagementRestricted) {
      return (
        <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Insufficient permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>You do not have access to manage this user group.</p>
              <p className="text-sm">
                Please switch to another section or contact an administrator for
                elevated access.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (activeModule) {
      case "overview":
        return renderOverview();
      case "fees":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <FeeManagement />
          </div>
        );
      case "due-payments":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <DuePayments />
          </div>
        );
      case "attendance-qr":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <AttendanceQR />
          </div>
        );
      case "staff-management":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <StaffManagement />
          </div>
        );
      case "inquiry-management":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <InquiryManagement />
          </div>
        );
      case "students":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <StudentManagement />
          </div>
        );
      case "teachers":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <TeacherManagement />
          </div>
        );
      case "classes":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <CourseManagement />
          </div>
        );
      case "course-categories":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <CourseCategoryManagement />
          </div>
        );
      case "scheduling":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8 space-y-6">
            <CourseScheduleManager
              courseOptions={scheduleCourseOptions}
              heading="Scheduling Calendar"
              description=" Tap a date to add and update course schedule."
              mode="manage"
            />
          </div>
        );
      case "material-distribution":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <PhysicalMaterialDistribution />
          </div>
        );
      case "course-access":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <CourseAccessControl />
          </div>
        );
      case "showcase-management":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <ShowcaseManagement />
          </div>
        );
      case "notifications":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <Notifications />
          </div>
        );
      case "profile":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-foreground">{session?.user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-foreground">{session?.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <p className="text-foreground">
                    {session?.user?.role?.replace("_", " ").toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex w-full px-4 pb-4 flex-col min-h-[calc(100vh-3.5rem)] lg:flex-row gap-2">
      <DashboardSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        menuEntries={menuEntries}
      />

      <main className="mx-auto flex h-full w-full max-w-7xl flex-col rounded-2xl border border-border bg-background shadow-sm">
        {renderContent()}
      </main>
    </div>
  );
}
