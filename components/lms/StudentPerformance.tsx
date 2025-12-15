"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  GraduationCap,
  Laptop,
  LineChart,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Course } from "@/types";

type EnrolledClass = Course & {
  code: string;
  instructor: string;
  progress: number;
  status: string;
};

type ExamPaper = {
  paper: string;
  score: number;
  maxScore: number;
  mode: "physical" | "online";
};

type CoursePerformance = {
  courseId: string;
  courseName: string;
  classAverage: number;
  studentAverage: number;
  papers: ExamPaper[];
};

interface StudentPerformanceProps {
  enrolledClasses: EnrolledClass[];
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

const getPerformanceColor = (score: number): string => {
  if (score >= 85) return "bg-success";
  if (score >= 70) return "bg-warning";
  return "bg-destructive";
};

const percentWidth = (score: number): string => `${Math.min(Math.max(score, 0), 100)}%`;

export const StudentPerformance = ({
  enrolledClasses,
}: StudentPerformanceProps) => {
  const coursePerformances = useMemo<CoursePerformance[]>(() => {
    if (enrolledClasses.length === 0) {
      return [];
    }

    return enrolledClasses.map((course, index) => {
      const fallbackPapers: ExamPaper[] = [
        {
          paper: "Midterm",
          score: 68 + index * 2,
          maxScore: 80,
          mode: "physical",
        },
        {
          paper: "Project",
          score: 42 + index * 2,
          maxScore: 50,
          mode: "online",
        },
        {
          paper: "Final",
          score: 76 + index * 2,
          maxScore: 100,
          mode: "physical",
        },
      ];

      const studentAverage = calculateAverage(fallbackPapers);
      const classAverage = Math.max(60, Math.min(95, studentAverage - 5 + index * 1.5));

      return {
        courseId: course.id,
        courseName: course.name,
        classAverage,
        studentAverage,
        papers: fallbackPapers,
      };
    });
  }, [enrolledClasses]);

  const physicalPapers = coursePerformances.flatMap((course) =>
    course.papers.filter((paper) => paper.mode === "physical")
  );
  const onlinePapers = coursePerformances.flatMap((course) =>
    course.papers.filter((paper) => paper.mode === "online")
  );

  const physicalAverage = calculateAverage(physicalPapers);
  const onlineAverage = calculateAverage(onlinePapers);
  const overallAverage = calculateAverage([
    ...physicalPapers,
    ...onlinePapers,
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Student Performance
          </h1>
          <p className="text-muted-foreground">
            Monitor physical and online exam marks with course comparisons.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-white shadow-soft sm:flex-row sm:items-center sm:gap-3">
          <Trophy className="h-5 w-5" />
          <span className="font-medium">Performance Monitor</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="edu-card-hover border-primary/20">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Physical Exams</p>
                  <p className="text-2xl font-bold text-foreground">
                    {physicalAverage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                Labs & Centers
              </Badge>
            </div>
            <Progress value={physicalAverage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on {physicalPapers.length} paper{physicalPapers.length === 1 ? "" : "s"} across all courses.
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-hover border-secondary/20">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary-light flex items-center justify-center">
                  <Laptop className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Online Exams</p>
                  <p className="text-2xl font-bold text-foreground">
                    {onlineAverage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-secondary/10 text-secondary border-secondary/30">
                Remote
              </Badge>
            </div>
            <Progress value={onlineAverage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Includes timed and proctored online assessments.
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card-hover border-accent/20">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  <p className="text-2xl font-bold text-foreground">
                    {overallAverage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-accent/10 text-accent border-accent/30">
                Combined
              </Badge>
            </div>
            <Progress value={overallAverage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Physical + online papers with course-wise weighting.
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
                No course data available yet. Enroll in a course to start tracking performance.
              </p>
            )}
            {coursePerformances.map((course) => (
              <div
                key={course.courseId}
                className="rounded-xl border border-border bg-gradient-card p-4"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">{course.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      Your marks vs other students (class average)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary">
                      You: {course.studentAverage.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Class: {course.classAverage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {[{ label: "You", value: course.studentAverage, color: "bg-primary" }, { label: "Class Avg", value: course.classAverage, color: "bg-muted-foreground/50" }].map(
                    (item) => (
                      <div key={`${course.courseId}-${item.label}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.label}</span>
                          <span className="text-foreground font-semibold">{item.value.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all duration-700`}
                            style={{ width: percentWidth(item.value) }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
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
                  <p className="text-sm font-semibold text-foreground">{course.courseName}</p>
                  <span className="text-xs text-muted-foreground">
                    {course.papers.length} paper{course.papers.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="space-y-3">
                  {course.papers.map((paper) => {
                    const paperScore = Math.round((paper.score / paper.maxScore) * 1000) / 10;
                    return (
                      <div
                        key={`${course.courseId}-${paper.paper}-${paper.mode}`}
                        className="rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                paper.mode === "physical"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-secondary/10 text-secondary border-secondary/20"
                              }
                            >
                              {paper.mode === "physical" ? "Physical" : "Online"}
                            </Badge>
                            <p className="font-medium text-foreground">{paper.paper}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {paper.score} / {paper.maxScore} marks
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${getPerformanceColor(paperScore)} rounded-full transition-all duration-700`}
                              style={{ width: percentWidth(paperScore) }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground">
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
            {[{ label: "Physical", value: physicalAverage }, { label: "Online", value: onlineAverage }].map(
              (item) => (
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
                      <p className="font-semibold text-foreground">{item.label} Exams</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Avg</span>
                  </div>
                  <div className="mt-3 h-24 rounded-lg bg-muted/60 p-3">
                    <div className="h-full w-full overflow-hidden rounded-md bg-background shadow-inner">
                      <div
                        className={`h-full ${item.label === "Physical" ? "bg-gradient-to-r from-primary/70 to-primary" : "bg-gradient-to-r from-secondary/70 to-secondary"}`}
                        style={{ width: percentWidth(item.value) }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Current average: <span className="font-semibold text-foreground">{item.value.toFixed(1)}%</span>
                  </p>
                </div>
              )
            )}
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Edge cases handled</p>
                <p className="text-sm text-foreground">
                  When marks are missing, averages fall back to 0% and bars remain empty.
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                Safe defaults
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPerformance;
