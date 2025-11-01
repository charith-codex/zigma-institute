"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useCourses, useClasses } from "@/hooks/useData";

import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  BarChart3,
  Plus,
  Calendar,
  TrendingUp,
  UserCheck,
  FileText,
  Clock,
} from "lucide-react";
import { PhysicalMaterialDistribution } from "./PhysicalMaterialDistribution";
import { Notifications } from "./Notifications";
import { Settings } from "./Settings";
import FeeManagement from "./FeeManagement";
import AttendanceQR from "./AttendanceQR";
import { StaffManagement } from "./StaffManagement";
import { InquiryManagement } from "./InquiryManagement";
import { StudentManagement } from "../cms/StudentManagement";
import { TeacherManagement } from "./TeacherManagement";
import { ClassManagement } from "./ClassManagement";
import { StudentRegistrationManagement } from "./StudentRegistrationManagement";
import { ShowcaseManagement } from "./ShowcaseManagement";

interface DashboardContentProps {
  activeModule: string;
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  };
}

export function DashboardContent({
  activeModule,
  session,
}: DashboardContentProps) {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { courses } = useCourses();
  const { classes } = useClasses();

  const dashboardStats = [
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
    },
    {
      title: "Active Courses",
      value: statsLoading ? "..." : courses.length.toString(),
      change: "+5%",
      icon: BookOpen,
      color: "success",
    },
  ];

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
    { title: "Add Student", icon: Users, action: "add-student" },
    { title: "Create Course", icon: BookOpen, action: "create-course" },
    { title: "Schedule Class", icon: Calendar, action: "schedule-class" },
    { title: "Generate Report", icon: BarChart3, action: "generate-report" },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="edu-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <action.icon className="w-4 h-4" />
                {action.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
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
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <activity.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
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
  );

  const renderContent = () => {
    switch (activeModule) {
      case "overview":
        return renderOverview();
      case "fees":
        return <FeeManagement />;
      case "attendance-qr":
        return <AttendanceQR />;
      case "student-registration":
        return <StudentRegistrationManagement />;
      case "staff-management":
        return <StaffManagement />;
      case "inquiry-management":
        return <InquiryManagement />;
      case "students":
        return <StudentManagement />;
      case "teachers":
        return <TeacherManagement />;
      case "classes":
        return <ClassManagement />;
      case "scheduling":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Class Scheduling</h1>
                <p className="text-muted-foreground">
                  Manage class schedules and approve teacher requests
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <p>calendar</p>
              </div>
            </div>
          </div>
        );
      case "material-distribution":
        return <PhysicalMaterialDistribution />;
      case "showcase-management":
        return <ShowcaseManagement />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      case "profile":
        return (
          <div className="max-w-2xl mx-auto">
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

  return <div className="p-6">{renderContent()}</div>;
}
