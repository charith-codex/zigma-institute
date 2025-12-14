"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnrollments, useAssignments, useCourses } from "@/hooks/useData";
import { BookOpen, Star, CheckCircle, Video } from "lucide-react";
import { LmsSidebar } from "@/components/lms/LmsSidebar";
import AIStudyTools from "@/components/lms/AIStudyTools";
import { CourseDetailView } from "@/components/lms/CourseDetailView";
import { DailyQuotes } from "@/components/lms/DailyQuotes";
import { PaymentSection } from "@/components/lms/PaymentSection";
import StudentPerformance from "@/components/lms/StudentPerformance";
import { CourseScheduleManager } from "@/components/scheduling/CourseScheduleManager";
import { PublishedExams } from "@/components/lms/PublishedExams";
import CourseCard from "@/components/courses/course-card";
import { Course } from "@/types";
import { Input } from "@/components/ui/input";
import { CourseEnrollment } from "@/components/lms/CourseEnrollment";

type EnrolledClass = Course & {
  code: string;
  instructor: string;
  progress: number;
  status: string;
};

const LMS = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [selectedClass, setSelectedClass] = useState<EnrolledClass | null>(
    null
  );
  const [nameQuery, setNameQuery] = useState("");
  const {
    enrollments,
    loading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useEnrollments();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { courses } = useCourses();
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(0);

  const enrolledClasses = useMemo<EnrolledClass[]>(
    () =>
      enrollments.map((enrollment) => {
        const course = courses.find((item) => item.id === enrollment.courseId);
        const fallbackDate = new Date(enrollment.enrolledAt);

        const hydratedCourse: Course =
          course ?? {
            id: enrollment.courseId,
            name: enrollment.courseName,
            slug: enrollment.courseSlug ?? enrollment.courseId,
            description: "Course description will be available soon.",
            coverImage: "/logo.png",
            teacherName: enrollment.teacherName ?? "Instructor",
            teacherId: null,
            courseCategoryId: course?.courseCategoryId ?? "",
            courseCategory: course?.courseCategory ?? null,
            priceInCents:
              course?.priceInCents ?? Math.max(enrollment.priceInCents, 0),
            currency: course?.currency ?? enrollment.currency,
            createdAt: course?.createdAt ?? fallbackDate,
            updatedAt: course?.updatedAt ?? fallbackDate,
          };

        return {
          ...hydratedCourse,
          code:
            hydratedCourse.slug?.toUpperCase() ??
            hydratedCourse.id.slice(0, 8).toUpperCase(),
          instructor: hydratedCourse.teacherName ?? "Instructor",
          progress: 0,
          status: "active",
        } satisfies EnrolledClass;
      }),
    [courses, enrollments]
  );

  const filteredClasses = useMemo<EnrolledClass[]>(() => {
    const normalizedQuery = nameQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return enrolledClasses;
    }

    return enrolledClasses.filter((classItem) =>
      classItem.name.toLowerCase().includes(normalizedQuery)
    );
  }, [enrolledClasses, nameQuery]);

  const scheduleCourseOptions = useMemo(
    () =>
      enrolledClasses.map((course) => ({
        id: course.id,
        name: course.name,
        teacherId: course.teacherId ?? `${course.id}-teacher`,
        teacherName: course.teacherName ?? "Instructor",
      })),
    [enrolledClasses]
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
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-orange-600" />
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
                        <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Hours Watched
                          </p>
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
                      Your learning journey continues. Explore your courses,
                      check upcoming schedules, and make the most of your LMS
                      experience.
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

                  {filteredClasses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredClasses.map((classItem) => (
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

            {activeModule === "study-tools" && <AIStudyTools />}

            {activeModule === "performance" && (
              <StudentPerformance enrolledClasses={enrolledClasses} />
            )}

            {activeModule === "enroll" && (
              <CourseEnrollment
                onEnrolled={() => {
                  void refetchEnrollments();
                  setPaymentRefreshKey((previous) => previous + 1);
                }}
              />
            )}

            {activeModule === "payments" && (
              <PaymentSection refreshKey={paymentRefreshKey} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LMS;
