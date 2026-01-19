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
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  DashboardSidebar,
  getMenuEntriesForRole,
} from "@/components/eims/DashboardSidebar";
import { cn } from "@/lib/utils";
import { useDashboardStats, useCourses } from "@/hooks/useData";
import { PhysicalMaterialDistribution } from "@/components/eims/PhysicalMaterialDistribution";
import { Notifications } from "@/components/eims/Notifications";
import FeeManagement from "@/components/eims/FeeManagement";
import AttendanceQR from "@/components/eims/AttendanceQR";
import { StaffManagement } from "@/components/eims/manage-users/StaffManagement";
import { InquiryManagement } from "@/components/eims/InquiryManagement";
import { TeacherManagement } from "@/components/eims/manage-users/TeacherManagement";
import { CourseManagement } from "@/components/eims/CourseManagement";
import { StudentManagement } from "@/components/eims/manage-users/StudentManagement";
import { CourseScheduleManager } from "@/components/scheduling/CourseScheduleManager";
import { CourseCategoryManagement } from "@/components/eims/CourseCategoryManagement";
import { CourseAccessControl } from "@/components/eims/CourseAccessControl";
import { DuePayments } from "@/components/eims/DuePayments";
import { GalleryManagement } from "@/components/eims/GalleryManagement";

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
    [courses],
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
          title: "Total Staff",
          value: statsLoading ? "..." : stats.staffCount?.toString() || "0",
          change: "+2%",
          icon: UserCheck,
          color: "accent",
        },
        {
          title: "Active Courses",
          value: statsLoading ? "..." : courses.length.toString(),
          change: "+5%",
          icon: BookOpen,
          color: "success",
        },
      ].filter((s) => !("hidden" in s) || !s.hidden),
    [stats, statsLoading, courses, isAttendance],
  );

  const quickActions = [
    {
      title: "Manage Students",
      description: "Add or update student records",
      icon: Users,
      module: "students",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-700 dark:text-blue-300",
      show: canManageStudents,
    },
    {
      title: "Manage Courses",
      description: "Create and edit course content",
      icon: BookOpen,
      module: "classes",
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-700 dark:text-purple-300",
      show: isAdmin || isManager,
    },
    {
      title: "Manage Schedule",
      description: "Set up class timetables",
      icon: Calendar,
      module: "scheduling",
      gradient: "from-green-500/10 via-green-500/5 to-transparent",
      iconBg: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-700 dark:text-green-300",
      show: isAdmin || isManager,
    },
    {
      title: "Fee Management",
      description: "Track payments and dues",
      icon: DollarSign,
      module: "fees",
      gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
      iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      textColor: "text-orange-700 dark:text-orange-300",
      show: !isAttendance,
    },
    {
      title: "Attendance QR",
      description: "Generate attendance codes",
      icon: Clock,
      module: "attendance-qr",
      gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
      iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      textColor: "text-cyan-700 dark:text-cyan-300",
      show: true,
    },
    {
      title: "Manage Teachers",
      description: "Assign and update faculty",
      icon: GraduationCap,
      module: "teachers",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      textColor: "text-rose-700 dark:text-rose-300",
      show: canManageStudents,
    },
  ].filter((action) => action.show);

  const menuEntries = useMemo(
    () => getMenuEntriesForRole(userRole),
    [userRole],
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

  // Mock data for charts - in production, fetch from API
  const enrollmentTrendData = useMemo(
    () => [
      { month: "Aug", students: 45, teachers: 8 },
      { month: "Sep", students: 62, teachers: 10 },
      { month: "Oct", students: 78, teachers: 12 },
      { month: "Nov", students: 95, teachers: 14 },
      { month: "Dec", students: 112, teachers: 15 },
      {
        month: "Jan",
        students: stats.studentCount || 128,
        teachers: stats.teacherCount || 16,
      },
    ],
    [stats],
  );

  const courseDistributionData = useMemo(() => {
    const activeCount = courses.length;
    const totalSlots = Math.max(activeCount + 2, 15);
    const inactiveCount = totalSlots - activeCount;
    return [
      { name: "Active Courses", value: activeCount, color: "#10b981" },
      { name: "Available Slots", value: inactiveCount, color: "#6b7280" },
    ];
  }, [courses]);

  const recentActivityData = useMemo(
    () => [
      { day: "Mon", enrollments: 12, completions: 8, attendance: 85 },
      { day: "Tue", enrollments: 15, completions: 10, attendance: 88 },
      { day: "Wed", enrollments: 8, completions: 12, attendance: 92 },
      { day: "Thu", enrollments: 18, completions: 15, attendance: 87 },
      { day: "Fri", enrollments: 22, completions: 18, attendance: 90 },
      { day: "Sat", enrollments: 10, completions: 9, attendance: 78 },
      { day: "Sun", enrollments: 5, completions: 6, attendance: 65 },
    ],
    [],
  );

  const revenueData = useMemo(
    () => [
      { month: "Aug", revenue: 12500 },
      { month: "Sep", revenue: 18200 },
      { month: "Oct", revenue: 22100 },
      { month: "Nov", revenue: 25800 },
      { month: "Dec", revenue: 31200 },
      { month: "Jan", revenue: 28500 },
    ],
    [],
  );

  const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {dashboardStats.map((stat: any, index: number) => {
            const gradients = {
              primary: "from-blue-500/20 via-blue-500/10 to-transparent",
              secondary: "from-purple-500/20 via-purple-500/10 to-transparent",
              accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
              success: "from-orange-500/20 via-orange-500/10 to-transparent",
            };

            const iconBgColors = {
              primary:
                "bg-blue-500/15 dark:bg-blue-500/25 group-hover:bg-blue-500/25 dark:group-hover:bg-blue-500/35",
              secondary:
                "bg-purple-500/15 dark:bg-purple-500/25 group-hover:bg-purple-500/25 dark:group-hover:bg-purple-500/35",
              accent:
                "bg-emerald-500/15 dark:bg-emerald-500/25 group-hover:bg-emerald-500/25 dark:group-hover:bg-emerald-500/35",
              success:
                "bg-orange-500/15 dark:bg-orange-500/25 group-hover:bg-orange-500/25 dark:group-hover:bg-orange-500/35",
            };

            const iconColors = {
              primary: "text-blue-600 dark:text-blue-400",
              secondary: "text-purple-600 dark:text-purple-400",
              accent: "text-emerald-600 dark:text-emerald-400",
              success: "text-orange-600 dark:text-orange-400",
            };

            const textColors = {
              primary: "text-blue-700 dark:text-blue-300",
              secondary: "text-purple-700 dark:text-purple-300",
              accent: "text-emerald-700 dark:text-emerald-300",
              success: "text-orange-700 dark:text-orange-300",
            };

            return (
              <Card
                key={index}
                className={cn(
                  "group relative overflow-hidden transition-all duration-300 border-border/60",
                  "hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
                  "bg-linear-to-br",
                  gradients[stat.color as keyof typeof gradients],
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3
                        className={cn(
                          "text-3xl font-bold tracking-tight transition-colors",
                          textColors[stat.color as keyof typeof textColors],
                        )}
                      >
                        {stat.value}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        "group-hover:scale-110 group-hover:rotate-3",
                        iconBgColors[stat.color as keyof typeof iconBgColors],
                      )}
                    >
                      <stat.icon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          iconColors[stat.color as keyof typeof iconColors],
                        )}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Subtle animated border effect */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(var(--primary), 0.1), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s infinite",
                  }}
                />
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        {!isAttendance && quickActions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden transition-all duration-300",
                    "border-border/60 hover:border-primary/40",
                    "bg-linear-to-br",
                    action.gradient,
                    "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
                  )}
                  onClick={() => setActiveModule(action.module)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl transition-all duration-300",
                          "group-hover:scale-110",
                          action.iconBg,
                        )}
                      >
                        <action.icon
                          className={cn("h-6 w-6", action.iconColor)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold text-base mb-1.5",
                            action.textColor,
                          )}
                        >
                          {action.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Decorative gradient overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Enrollment Trends */}
          <Card className="overflow-hidden border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Enrollment Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={enrollmentTrendData}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorTeachers"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    name="Students"
                  />
                  <Area
                    type="monotone"
                    dataKey="teachers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTeachers)"
                    name="Teachers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Distribution */}
          <Card className="overflow-hidden border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Course Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={courseDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          {!isAttendance && (
            <Card className="overflow-hidden border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={recentActivityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="enrollments"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Enrollments"
                    />
                    <Bar
                      dataKey="completions"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Completions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Revenue Trends */}
          {!isAttendance && (
            <Card className="overflow-hidden border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [
                        `$${(value || 0).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
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
      case "gallery-management":
        return (
          <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <GalleryManagement />
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
