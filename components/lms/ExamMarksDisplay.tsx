"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ClipboardList,
  ExternalLink,
  Laptop,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Course } from "@/types";
import {
  getStudentPerformance,
  StudentPerformanceData,
} from "@/lib/actions/student-performance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FlowerLoader } from "../ui/flower-loader";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type EnrolledCourse = Course & {
  code: string;
  teacher: string;
  progress: number;
  status: string;
};

interface ExamMarksDisplayProps {
  enrolledCourses: EnrolledCourse[];
}

export default function ExamMarksDisplay({
  enrolledCourses,
}: ExamMarksDisplayProps) {
  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getStudentPerformance();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(
          "An unexpected error occurred while fetching your exam marks.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const courseExams = useMemo(() => {
    if (!data) return [];

    return enrolledCourses
      .map((course) => {
        const physicals = data.physicalExams.filter(
          (e) => e.courseId === course.id,
        );
        const onlines = data.onlineExams.filter(
          (e) => e.courseId === course.id,
        );

        return {
          ...course,
          physicals,
          onlines,
          totalExams: physicals.length + onlines.length,
        };
      })
      .filter((c) => c.totalExams > 0);
  }, [data, enrolledCourses]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <FlowerLoader size="md" className="text-primary animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (courseExams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <div className="p-6 rounded-full bg-muted/30">
          <BookOpen className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">No Exam Marks Found</h3>
          <p className="text-muted-foreground max-w-sm">
            You do not have any recorded exam marks yet. Keep learning and take
            exams to see your exam marks here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Exam Marks
        </h1>
        <p className="text-muted-foreground text-sm">
          Detailed breakdown of your physical and online exam results per
          course.
        </p>
      </div>

      <div className="grid gap-4">
        {courseExams.map((course) => (
          <Card
            key={course.id}
            className={cn(
              "edu-card transition-all duration-300",
              expandedCourseId === course.id
                ? "ring-2 ring-primary/20 shadow-lg"
                : "hover:shadow-md",
            )}
          >
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() =>
                setExpandedCourseId(
                  expandedCourseId === course.id ? null : course.id,
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-normal">
                        {course.physicals.length} Physical
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal">
                        {course.onlines.length} Online
                      </Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    expandedCourseId === course.id && "rotate-90",
                  )}
                />
              </div>
            </CardHeader>

            {expandedCourseId === course.id && (
              <CardContent className="pt-0 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-px bg-border/50" />

                {course.physicals.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <ClipboardList className="w-4 h-4" />
                      Physical Exams
                    </h3>
                    <div className="grid gap-3">
                      {course.physicals.map((exam) => (
                        <div
                          key={exam.id}
                          className="group flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <ClipboardList className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{exam.examTitle}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                {format(new Date(exam.recordedAt), "PPP")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {exam.score}%
                              </p>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                Marks
                              </p>
                            </div>
                            {exam.paperUrl && (
                              <a
                                href={exam.paperUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                title="View Marked Paper"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.onlines.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <Laptop className="w-4 h-4" />
                      Online Exams
                    </h3>
                    <div className="grid gap-3">
                      {course.onlines.map((exam) => (
                        <div
                          key={exam.id}
                          className="group flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                              <Laptop className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{exam.examTitle}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] h-4",
                                    exam.status === "GRADED"
                                      ? "bg-success/10 text-success border-success/20"
                                      : "bg-warning/10 text-warning border-warning/20",
                                  )}
                                >
                                  {exam.status}
                                </Badge>
                                {exam.submittedAt && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(exam.submittedAt), "PPP")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {exam.score !== null
                                ? `${exam.score} / ${exam.totalMarks}`
                                : "N/A"}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                              Score
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
