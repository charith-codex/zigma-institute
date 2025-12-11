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
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { courses } = useCourses();

  const enrolledClasses = useMemo<EnrolledClass[]>(
    () =>
      courses.map((course) => ({
        ...course,
        code: course.slug?.toUpperCase() ?? course.id.slice(0, 8).toUpperCase(),
        instructor: course.teacherName ?? "Instructor",
        progress: 0,
        status: "active",
      })),
    [courses]
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
      courses.map((course) => ({
        id: course.id,
        name: course.name,
        teacherId: course.teacherId ?? `${course.id}-teacher`,
        teacherName: course.teacherName ?? "Instructor",
      })),
    [courses]
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
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-accent" />
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
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Hours Watched
                          </p>
                          <p className="text-xl font-bold">47h</p>
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
                      Your learning journey continues. You have{" "}
                      {assignments.length} assignments to review.
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
                        Track your progress across all enrolled courses
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

            {activeModule === "payments" && <PaymentSection />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LMS;
