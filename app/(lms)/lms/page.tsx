"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEnrollments, useCourses } from "@/hooks/useData";
import { BookOpen } from "lucide-react";
import { LmsSidebar } from "@/components/lms/LmsSidebar";
import AIStudyTools from "@/components/lms/AIStudyTools";
import { CourseDetailView } from "@/components/lms/CourseDetailView";
import { PaymentSection } from "@/components/lms/PaymentSection";
import StudentPerformance from "@/components/lms/StudentPerformance";
import { CourseScheduleManager } from "@/components/scheduling/CourseScheduleManager";
import { PublishedExams } from "@/components/lms/PublishedExams";
import ExamMarksDisplay from "@/components/lms/ExamMarksDisplay";
import CourseCard from "@/components/courses/course-card";
import { Course } from "@/types";
import { Input } from "@/components/ui/input";
import { CourseEnrollment } from "@/components/lms/CourseEnrollment";
import { StudentIdCardDisplay } from "@/components/lms/StudentIdCardDisplay";
import { WelcomeBanner } from "@/components/lms/WelcomeBanner";
import { QuickActions } from "@/components/lms/QuickActions";

type EnrolledCourse = Course & {
  code: string;
  teacher: string;
  progress: number;
  status: string;
};

const LMS = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(
    null,
  );
  const [nameQuery, setNameQuery] = useState("");
  const searchParams = useSearchParams();
  const {
    enrollments,
    loading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useEnrollments();
  const { courses } = useCourses();
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(0);

  const enrolledCourses = useMemo<EnrolledCourse[]>(() => {
    const byCourseId = new Map<string, EnrolledCourse>();

    enrollments.forEach((enrollment) => {
      const course = courses.find((item) => item.id === enrollment.courseId);
      const fallbackDate = new Date(enrollment.enrolledAt);

      const hydratedCourse: Course = course ?? {
        id: enrollment.courseId,
        name: enrollment.courseName,
        slug: enrollment.courseSlug ?? enrollment.courseId,
        description: "Course description will be available soon.",
        coverImage: "/logo.png",
        teacherName: enrollment.teacherName ?? "Teacher",
        teacherId: null,
        courseCategoryId: "",
        courseCategory: null,
        priceInCents: Math.max(enrollment.priceInCents, 0),
        currency: enrollment.currency,
        createdAt: fallbackDate,
        updatedAt: fallbackDate,
      };

      const enrolledCourse: EnrolledCourse = {
        ...hydratedCourse,
        code:
          hydratedCourse.slug?.toUpperCase() ??
          hydratedCourse.id.slice(0, 8).toUpperCase(),
        teacher: hydratedCourse.teacherName ?? "Teacher",
        progress: 0,
        status: "active",
      };

      if (!byCourseId.has(enrolledCourse.id)) {
        byCourseId.set(enrolledCourse.id, enrolledCourse);
      }
    });

    return Array.from(byCourseId.values());
  }, [courses, enrollments]);

  // Mock data for dashboard stats - replace with real data from API
  const dashboardStats = useMemo(
    () => ({
      enrolledCourses: enrolledCourses.length,
      completedCourses: enrolledCourses.filter((c) => c.status === "completed")
        .length,
      averageGrade: 85, // TODO: Calculate from actual grades
      totalHoursWatched: 42, // TODO: Get from video tracking
      upcomingExams: 3, // TODO: Get from exams API
      pendingAssignments: 5, // TODO: Get from assignments API
      currentStreak: 7, // TODO: Calculate from user activity
      achievementsUnlocked: 12, // TODO: Get from achievements system
    }),
    [enrolledCourses],
  );

  // Mock upcoming classes - replace with real schedule data
  const upcomingClasses = useMemo(
    () => [
      // TODO: Fetch from schedules API
      // Example structure:
      // {
      //   id: "1",
      //   courseId: "course-1",
      //   courseName: "Mathematics",
      //   teacherName: "Dr. Smith",
      //   startTime: new Date(),
      //   endTime: new Date(),
      //   location: "Room 101",
      //   isOnline: false,
      //   status: "scheduled" as const,
      // },
    ],
    [],
  );

  const filteredCourses = useMemo<EnrolledCourse[]>(() => {
    const normalizedQuery = nameQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return enrolledCourses;
    }

    return enrolledCourses.filter((courseItem) =>
      courseItem.name.toLowerCase().includes(normalizedQuery),
    );
  }, [enrolledCourses, nameQuery]);

  const scheduleCourseOptions = useMemo(
    () =>
      enrolledCourses.map((course) => ({
        id: course.id,
        name: course.name,
        teacherId: course.teacherId ?? `${course.id}-teacher`,
        teacherName: course.teacherName ?? "Teacher",
      })),
    [enrolledCourses],
  );

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus !== "success" || !sessionId) {
      return;
    }

    let cancelled = false;

    const clearPaymentParams = () => {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("payment");
      currentUrl.searchParams.delete("courseId");
      currentUrl.searchParams.delete("planId");
      currentUrl.searchParams.delete("session_id");
      window.history.replaceState({}, document.title, currentUrl.toString());
    };

    const finalizePayment = async () => {
      try {
        const response = await fetch(
          `/api/payments/checkout?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Unable to verify payment session.");
        }

        const payload = (await response.json()) as { paid?: boolean };

        if (!payload.paid) {
          return;
        }

        await refetchEnrollments();
        setPaymentRefreshKey((previous) => previous + 1);
      } catch (verificationError) {
        console.error("Failed to finalize payment", verificationError);
      } finally {
        if (!cancelled) {
          clearPaymentParams();
        }
      }
    };

    void finalizePayment();

    return () => {
      cancelled = true;
    };
  }, [refetchEnrollments, searchParams]);

  return (
    <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <LmsSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-6">
          {activeModule === "dashboard" && (
            <>
              {/* Welcome Banner */}
              <WelcomeBanner />

              {/* Quick Actions */}
              <QuickActions
                onActionClick={setActiveModule}
                upcomingExams={dashboardStats.upcomingExams}
                pendingPayments={0}
                newNotifications={0}
              />
            </>
          )}

          {activeModule === "classes" &&
            (selectedCourse ? (
              <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
                <CourseDetailView
                  classData={selectedCourse}
                  onBack={() => setSelectedCourse(null)}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground">
                      Click on a course to start learning.
                    </p>
                  </div>
                  <div className="space-y-2 max-w-sm w-full sm:w-auto">
                    <Input
                      id="course-name"
                      placeholder="Search course by name"
                      value={nameQuery}
                      onChange={(event) => setNameQuery(event.target.value)}
                    />
                  </div>
                </div>

                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((courseItem) => (
                      <CourseCard
                        key={courseItem.id}
                        course={courseItem}
                        showPrice={false}
                        showDescription
                        href={`/lms/courses/${courseItem.slug}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setSelectedCourse(courseItem);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                    <BookOpen className="h-10 w-10 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        No courses found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try a different course name.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {activeModule === "exams" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <PublishedExams
                heading="Exams"
                description="Browse available exams and start a session when you're ready."
              />
            </div>
          )}

          {activeModule === "schedule" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <CourseScheduleManager
                courseOptions={scheduleCourseOptions}
                heading="My Course Schedule"
                description="Check upcoming classes on a responsive calendar."
                mode="view"
              />
            </div>
          )}

          {activeModule === "study-tools" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <AIStudyTools />
            </div>
          )}

          {activeModule === "performance" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <StudentPerformance enrolledCourses={enrolledCourses} />
            </div>
          )}

          {activeModule === "exam-marks" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <ExamMarksDisplay enrolledCourses={enrolledCourses} />
            </div>
          )}

          {activeModule === "enroll" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <CourseEnrollment
                onEnrolled={() => {
                  void refetchEnrollments();
                  setPaymentRefreshKey((previous) => previous + 1);
                }}
              />
            </div>
          )}

          {activeModule === "payments" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <PaymentSection refreshKey={paymentRefreshKey} />
            </div>
          )}

          {activeModule === "id-card" && (
            <div className="rounded-2xl border border-border bg-background shadow-sm p-4 sm:p-6 lg:p-8">
              <StudentIdCardDisplay />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LMS;
