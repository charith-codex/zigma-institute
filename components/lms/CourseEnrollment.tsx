"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCourses, useEnrollments } from "@/hooks/useData";
import { deriveMonthlyAmount } from "@/lib/payments";
import { Course } from "@/types";
import {
  AlertCircle,
  BookOpen,
  CreditCard,
  Loader2,
  Search,
  ShieldCheck,
  Wallet2,
} from "lucide-react";

interface CourseEnrollmentProps {
  onEnrolled?: () => void;
}

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );

const getMonthlyAmount = (course: Course) =>
  formatCurrency(deriveMonthlyAmount(course.priceInCents), course.currency);

export function CourseEnrollment({ onEnrolled }: CourseEnrollmentProps) {
  const { toast } = useToast();
  const { courses, loading: coursesLoading, error: coursesError, refetch: refetchCourses } =
    useCourses();
  const {
    enrollments,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useEnrollments();
  const [search, setSearch] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.courseId)),
    [enrollments]
  );

  const filteredCourses = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return courses.filter((course) => {
      if (normalized.length === 0) {
        return true;
      }

      const nameMatch = course.name.toLowerCase().includes(normalized);
      const slugMatch = course.slug?.toLowerCase().includes(normalized) ?? false;

      return nameMatch || slugMatch;
    });
  }, [courses, search]);

  const handleEnroll = async (course: Course) => {
    if (enrolledIds.has(course.id)) {
      toast({
        title: "Already enrolled",
        description: "You are already enrolled in this course.",
        variant: "default",
      });
      return;
    }

    setEnrollingCourseId(course.id);

    try {
      const response = await fetch("/api/lms/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to enroll in this course.");
      }

      toast({
        title: "Enrollment confirmed",
        description: `${course.name} was added to your LMS. Monthly billing is now active.`,
      });

      await Promise.all([refetchEnrollments(), refetchCourses()]);
      onEnrolled?.();
    } catch (enrollError) {
      console.error("Failed to enroll", enrollError);
      toast({
        title: "Enrollment failed",
        description:
          enrollError instanceof Error
            ? enrollError.message
            : "We could not add this course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (coursesLoading || enrollmentsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your courses...</span>
        </CardContent>
      </Card>
    );
  }

  if (coursesError || enrollmentsError) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">{coursesError ?? enrollmentsError}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => Promise.all([refetchCourses(), refetchEnrollments()])}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Enroll in new courses</CardTitle>
          <CardDescription>
            Already registered students can add more classes and pay monthly fees without
            re-registering.
          </CardDescription>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No courses found</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);
              const monthlyAmount = getMonthlyAmount(course);

              return (
                <Card key={course.id} className="flex h-full flex-col border-muted">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="gap-2">
                        <Wallet2 className="h-4 w-4" />
                        {monthlyAmount} per month
                      </Badge>
                      <Badge variant="outline" className="gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Billed until course completion
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pay at the end of each month for every enrolled course. Switching plans is
                      not required for additional classes.
                    </p>
                    <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-muted-foreground">
                        Teacher: {course.teacherName ?? "Instructor"}
                      </div>
                      <Button
                        variant={isEnrolled ? "secondary" : "default"}
                        disabled={isEnrolled || enrollingCourseId === course.id}
                        onClick={() => handleEnroll(course)}
                        className="gap-2"
                      >
                        {enrollingCourseId === course.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {isEnrolled ? "Enrolled" : "Enroll & start billing"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
