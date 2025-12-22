"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Users } from "lucide-react";
import { TeacherCourseList } from "@/components/cms/TeacherCourseList";
import { TeacherNotificationComposer } from "@/components/cms/TeacherNotificationComposer";
import { useTeacherDashboardData } from "@/hooks/useTeacherDashboardData";
import { FlowerLoader } from "@/components/ui/flower-loader";
import { CompactScheduleCalendar } from "@/components/cms/CompactScheduleCalendar";
import { useSchedules } from "@/hooks/useSchedules";

const metricIcons = {
  courses: BookOpen,
  students: Users,
  content: FileText,
};

export default function LmsCmsOverviewPage() {
  const router = useRouter();
  const { accessibleCourses, combinedLoading, isAuthenticated, teacherInfo } =
    useTeacherDashboardData();

  const contentItems = useMemo(
    () => Math.max(accessibleCourses.length * 6, 0),
    [accessibleCourses.length]
  );

  const { schedules } = useSchedules();

  if (combinedLoading) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-16">
        <div className="text-center">
          <FlowerLoader size="lg" className="text-[#A41FC5] mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-16">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-semibold">
            Please sign in to manage your courses
          </h2>
          <p className="text-sm text-muted-foreground">
            Access to the LMS CMS is restricted to authorized users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Welcome back, {teacherInfo.name || "Teacher"}
        </h1>
        <p className="text-muted-foreground text-base">
          Select a course below to open the full content management workspace.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardMetricCard
          title="Active Courses"
          value={teacherInfo.activeCourses}
          description="Courses currently available to manage"
          icon={metricIcons.courses}
        />
        <DashboardMetricCard
          title="Total Students"
          value={teacherInfo.totalStudents}
          description="Learners enrolled across all courses"
          icon={metricIcons.students}
        />
        <DashboardMetricCard
          title="Content Items"
          value={contentItems}
          description="Estimated lessons, questions, and resources"
          icon={metricIcons.content}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-background shadow-sm">
          <div className="p-6">
            <TeacherCourseList
              onSelectClass={(courseId) => router.push(`/lms-cms/${courseId}`)}
              courses={accessibleCourses}
              loading={combinedLoading}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <TeacherNotificationComposer />
          <CompactScheduleCalendar events={schedules} />
        </div>
      </section>
    </div>
  );
}

interface DashboardMetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof BookOpen;
}

function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardMetricCardProps) {
  return (
    <Card className="h-full rounded-2xl text-center border-border/60 bg-card/60 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
