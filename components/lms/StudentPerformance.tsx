"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  GraduationCap,
  Laptop,
  LineChart,
  ShieldCheck,
  Trophy,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Course } from "@/types";
import {
  getStudentPerformance,
  StudentPerformanceData,
} from "@/lib/actions/student-performance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FlowerLoader } from "../ui/flower-loader";

type EnrolledCourse = Course & {
  code: string;
  teacher: string;
  progress: number;
  status: string;
};

type ExamPaper = {
  id: string;
  paper: string;
  score: number;
  maxScore: number;
  mode: "physical" | "online";
  paperUrl?: string;
};

type CoursePerformance = {
  courseId: string;
  courseName: string;
  courseAverage: number;
  studentAverage: number;
  papers: ExamPaper[];
};

type PaperChartItem = {
  id: string;
  label: string;
  percent: number;
  color: string;
  mode: "physical" | "online";
};

interface StudentPerformanceProps {
  enrolledCourses: EnrolledCourse[];
}

const calculateAverage = (papers: ExamPaper[]): number => {
  if (papers.length === 0) {
    return 0;
  }

  const totalScored = papers.reduce((sum, paper) => sum + paper.score, 0);
  const totalPossible = papers.reduce((sum, paper) => sum + paper.maxScore, 0);

  if (totalPossible === 0) {
    return 0;
  }

  return Math.round((totalScored / totalPossible) * 1000) / 10;
};

const percentWidth = (score: number): string =>
  `${Math.min(Math.max(score, 0), 100)}%`;

export const StudentPerformance = ({
  enrolledCourses,
}: StudentPerformanceProps) => {
  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          "An unexpected error occurred while fetching performance data."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const coursePerformances = useMemo<CoursePerformance[]>(() => {
    if (!data || enrolledCourses.length === 0) {
      return [];
    }

    return enrolledCourses.map((course) => {
      // Filter papers for this course
      const physicals = data.physicalExams
        .filter((e) => e.courseName === course.name)
        .map(
          (e): ExamPaper => ({
            id: e.id,
            paper: e.examTitle,
            score: e.score,
            maxScore: 100, // Assuming 100 for percentage marks
            mode: "physical",
            paperUrl: e.paperUrl,
          })
        );

      const onlines = data.onlineExams
        .filter((e) => e.courseName === course.name)
        .map(
          (e): ExamPaper => ({
            id: e.id,
            paper: e.examTitle,
            score: e.score || 0,
            maxScore: e.totalMarks,
            mode: "online",
          })
        );

      const combinedPapers = [...physicals, ...onlines];
      const studentAverage = calculateAverage(combinedPapers);
      // Use real course average from server data, fallback to student's own average if none exists
      const courseAverage = data.courseAverages[course.id] ?? studentAverage;

      return {
        courseId: course.id,
        courseName: course.name,
        courseAverage,
        studentAverage,
        papers: combinedPapers,
      };
    });
  }, [data, enrolledCourses]);

  const coursePaperCharts: Record<string, PaperChartItem[]> = useMemo(() => {
    return coursePerformances.reduce<Record<string, PaperChartItem[]>>(
      (acc, course) => {
        const papers = course.papers.map<PaperChartItem>((paper) => {
          const paperScore =
            Math.round((paper.score / paper.maxScore) * 1000) / 10;

          return {
            id: paper.id,
            label: paper.paper,
            percent: Math.min(Math.max(paperScore, 0), 100),
            color: paper.mode === "physical" ? "bg-primary" : "bg-secondary",
            mode: paper.mode,
          };
        });

        acc[course.courseId] = papers;
        return acc;
      },
      {}
    );
  }, [coursePerformances]);

  const physicalPapers = coursePerformances.flatMap((course) =>
    course.papers.filter((paper) => paper.mode === "physical")
  );
  const onlinePapers = coursePerformances.flatMap((course) =>
    course.papers.filter((paper) => paper.mode === "online")
  );

  const physicalAverage = calculateAverage(physicalPapers);
  const onlineAverage = calculateAverage(onlinePapers);

  // Calculate Overall Average as (online + physical) / 2
  // Handle cases where one mode might have no data
  const overallAverage = useMemo(() => {
    if (physicalPapers.length > 0 && onlinePapers.length > 0) {
      return (physicalAverage + onlineAverage) / 2;
    }
    if (physicalPapers.length > 0) return physicalAverage;
    if (onlinePapers.length > 0) return onlineAverage;
    return 0;
  }, [
    physicalAverage,
    onlineAverage,
    physicalPapers.length,
    onlinePapers.length,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[600px] w-full items-center justify-center">
        <FlowerLoader
          size="md"
          className="text-primary mx-auto animate-pulse"
        />
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Student Performance
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor physical and online exam marks with course comparisons.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white backdrop-blur-sm border border-white/10 font-medium">
          <Trophy className="h-5 w-5" />
          <span>Performance Monitor</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="edu-card-hover border-blue-500/30 bg-card/50 backdrop-blur-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Physical Exams
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {physicalAverage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-500 border-blue-500/30"
              >
                Classroom
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-600 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                style={{ width: percentWidth(physicalAverage) }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              All enrolled courses: physical exams.
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-hover border-purple-500/30 bg-card/50 backdrop-blur-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Laptop className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Online Exams
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {onlineAverage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-500 border-purple-500/30"
              >
                Remote
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
              <div
                className="h-full rounded-full bg-linear-to-r from-violet-600 to-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                style={{ width: percentWidth(onlineAverage) }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              All enrolled courses: online exams.
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-hover border-primary/30 bg-card/50 backdrop-blur-md shadow-soft">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Average
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {overallAverage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30"
              >
                Combined
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-primary/70 shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                style={{ width: percentWidth(overallAverage) }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mean average of online and physical scores.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course-wise Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursePerformances.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No course data available yet. Enroll in a course to start
                tracking performance.
              </p>
            )}
            {coursePerformances.map((course) => (
              <div
                key={course.courseId}
                className="rounded-xl border border-border/50 bg-background/40 p-5 shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-foreground/90 tracking-tight">
                      {course.courseName}
                    </p>
                    <p className="text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider mt-0.5">
                      Your performance vs. Peers
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-muted/40 rounded-lg px-3 py-1.5 border border-border/50">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60">
                        You
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {course.studentAverage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-px h-6 bg-border/50" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60">
                        Course
                      </span>
                      <span className="text-sm font-bold text-muted-foreground/80">
                        {course.courseAverage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      label: "Your Score",
                      value: course.studentAverage,
                      color: "bg-linear-to-r from-primary to-primary/60",
                      glow: "shadow-[0_0_10px_rgba(var(--primary),0.3)]",
                    },
                    {
                      label: "Course Average",
                      value: course.courseAverage,
                      color: "bg-muted-foreground/30",
                      glow: "",
                    },
                  ].map((item) => (
                    <div
                      key={`${course.courseId}-${item.label}`}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground/80 font-medium">
                          {item.label}
                        </span>
                        <span className="text-foreground font-bold">
                          {item.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50 border border-border/20 shadow-inner">
                        <div
                          className={`${item.color} ${item.glow} h-full rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: percentWidth(item.value) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Paper-by-Paper Marks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coursePerformances.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Paper-level results will appear once you complete an exam.
              </p>
            )}
            {coursePerformances.map((course) => (
              <div
                key={`${course.courseId}-papers`}
                className="rounded-xl border border-border p-3 bg-muted/30"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {course.courseName}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {course.papers.length} paper
                    {course.papers.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Paper performance chart
                  </p>
                  <div className="mt-2 flex items-end gap-3 rounded-lg border border-dashed border-border bg-background px-3 py-4">
                    {(() => {
                      const paperChartData =
                        coursePaperCharts[course.courseId] ?? [];
                      if (paperChartData.length === 0) {
                        return (
                          <p className="text-xs text-muted-foreground">
                            No papers graded yet.
                          </p>
                        );
                      }

                      const maxPercent = Math.max(
                        ...paperChartData.map((item) => item.percent),
                        1
                      );

                      return paperChartData.map((paper) => {
                        const heightPercent =
                          (paper.percent / maxPercent) * 100;

                        return (
                          <div
                            key={paper.id}
                            className="flex flex-1 flex-col items-center gap-2"
                          >
                            <div
                              className="group relative flex h-32 w-full items-end rounded-lg bg-muted/40 p-1 shadow-inner border border-border/20"
                              aria-label={`${paper.label} ${paper.percent}%`}
                            >
                              <div
                                className={`absolute inset-x-1 bottom-1 ${paper.mode === "physical" ? "bg-blue-500/20" : "bg-purple-500/20"} rounded-sm transition-all duration-300 group-hover:opacity-100 opacity-0`}
                                style={{ height: "100%" }}
                              />
                              <div
                                className={`w-full rounded-md transition-all duration-1000 ease-in-out shadow-sm ${
                                  paper.mode === "physical"
                                    ? "bg-linear-to-t from-blue-600 to-blue-400"
                                    : "bg-linear-to-t from-purple-600 to-purple-400"
                                }`}
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-foreground/90">
                                {paper.percent.toFixed(1)}%
                              </p>
                              <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-tighter">
                                {paper.label}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                <div className="space-y-3">
                  {course.papers.map((paper) => {
                    const paperScore =
                      Math.round((paper.score / paper.maxScore) * 1000) / 10;
                    const isPhysical = paper.mode === "physical";
                    return (
                      <div
                        key={paper.id}
                        className={`rounded-lg border bg-background/60 p-3 shadow-sm transition-colors hover:bg-background/80 ${isPhysical ? "border-blue-500/20" : "border-purple-500/20"}`}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                isPhysical
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                                  : "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
                              }
                            >
                              {isPhysical ? "Physical" : "Online"}
                            </Badge>
                            <p className="font-semibold text-foreground/90">
                              {paper.paper}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              {paper.score} / {paper.maxScore} marks
                            </p>
                            {paper.paperUrl && (
                              <button
                                onClick={() =>
                                  window.open(paper.paperUrl, "_blank")
                                }
                                className="text-primary hover:text-primary-dark transition-colors"
                                title="View marked paper"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isPhysical
                                  ? "bg-linear-to-r from-blue-600 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                                  : "bg-linear-to-r from-purple-600 to-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                              }`}
                              style={{ width: percentWidth(paperScore) }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {paperScore.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Online vs Physical Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: "Physical", value: physicalAverage },
              { label: "Online", value: onlineAverage },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-gradient-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.label === "Physical" ? (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Laptop className="h-5 w-5 text-secondary" />
                    )}
                    <p className="font-semibold text-foreground">
                      {item.label} Exams
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">Avg</span>
                </div>
                <div className="mt-3 h-24 rounded-lg bg-muted/60 p-3">
                  <div className="h-full w-full overflow-hidden rounded-md bg-background shadow-inner">
                    <div
                      className={`h-full shadow-md ${
                        item.label === "Physical"
                          ? "bg-linear-to-r from-blue-600 via-indigo-500 to-blue-400 shadow-blue-500/20"
                          : "bg-linear-to-r from-purple-600 via-violet-500 to-purple-400 shadow-purple-500/20"
                      }`}
                      style={{ width: percentWidth(item.value) }}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Current average:{" "}
                  <span className="font-semibold text-foreground">
                    {item.value.toFixed(1)}%
                  </span>
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Live data active
                </p>
                <p className="text-sm text-foreground">
                  Performance metrics are calculated based on your recorded
                  marks and submissions.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-success/10 text-success border-success/20"
              >
                Verified Data
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPerformance;
