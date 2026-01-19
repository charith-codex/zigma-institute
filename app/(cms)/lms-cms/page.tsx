"use client";

import { useRouter } from "next/navigation";
import { TeacherCourseList } from "@/components/cms/TeacherCourseList";
import { TeacherNotificationComposer } from "@/components/cms/TeacherNotificationComposer";
import { useTeacherDashboardData } from "@/hooks/useTeacherDashboardData";
import { FlowerLoader } from "@/components/ui/flower-loader";
import { CompactScheduleCalendar } from "@/components/cms/CompactScheduleCalendar";
import { useSchedules } from "@/hooks/useSchedules";

export default function LmsCmsOverviewPage() {
  const router = useRouter();
  const { accessibleCourses, combinedLoading, isAuthenticated, teacherInfo } =
    useTeacherDashboardData();

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
