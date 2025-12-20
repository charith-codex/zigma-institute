"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourseSummaries } from "@/hooks/useData";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  CourseContentManager,
  courseNavigationItems,
  type CourseSectionId,
} from "@/components/cms/CourseContentManager";
import { useParams, useRouter } from "next/navigation";

import { useSession } from "next-auth/react";
import CmsSidebar from "@/components/cms/CmsSidebar";
import { SidebarInset } from "@/components/ui/sidebar";

const LMSCMS = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { courseSummaries, loading } = useCourseSummaries();
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role ?? null;
  const isAdmin = role === "ADMIN";
  const isTeacher = role === "TEACHER";

  const accessibleCourses = useMemo(() => {
    if (isAdmin) {
      return courseSummaries;
    }

    if (isTeacher && userId) {
      return courseSummaries.filter((cls) => cls.teacher_id === userId);
    }

    return [];
  }, [courseSummaries, isAdmin, isTeacher, userId]);

  const courseIsAccessible = useMemo(() => {
    if (!courseId) {
      return true;
    }

    return accessibleCourses.some((cls) => cls.id === courseId);
  }, [accessibleCourses, courseId]);

  const [activeSection, setActiveSection] =
    useState<CourseSectionId>("lessons");

  useEffect(() => {
    setActiveSection("lessons");
  }, [courseId]);

  // Filter classes for the current teacher
  const teacherCourses = accessibleCourses;

  const currentCourse = useMemo(
    () => accessibleCourses.find((cls) => cls.id === courseId),
    [accessibleCourses, courseId]
  );

  const isAuthenticated = Boolean(session?.user);
  const combinedLoading = loading || sessionLoading;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full bg-muted/20">
      <CmsSidebar
        items={[]} // Global items removed from sidebar in course view
        activeModule="class-content"
        onModuleChange={() => {}}
        courseNavItems={
          courseId && courseIsAccessible ? courseNavigationItems : undefined
        }
        activeCourseSection={
          courseId && courseIsAccessible ? activeSection : undefined
        }
        onCourseSectionChange={
          courseId && courseIsAccessible ? setActiveSection : undefined
        }
        courseDetails={
          courseId && courseIsAccessible && currentCourse
            ? {
                name: currentCourse.name,
                code:
                  currentCourse.code || currentCourse.slug || currentCourse.id,
                onBack: () => router.push("/lms-cms"),
              }
            : undefined
        }
      />

      <SidebarInset className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <div className="flex h-full w-full flex-col rounded-2xl border border-border/60 bg-background shadow-sm">
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
            ) : courseId && courseIsAccessible ? (
              <CourseContentManager
                courseId={courseId}
                courses={teacherCourses}
                loading={combinedLoading}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle>Course access required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {courseId
                        ? "You do not have permission to manage this course. Please select a course assigned to you from the list."
                        : "Please select a course to manage its content."}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => router.push("/lms-cms")}
                    >
                      Back to my courses
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default LMSCMS;
