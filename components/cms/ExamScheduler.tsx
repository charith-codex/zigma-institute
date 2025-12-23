"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  CalendarIcon,
  Clock,
  Users,
  Play,
  Square,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { getEnrolledStudents } from "@/lib/actions/enrolled-students";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ExamRecord = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  timeLimitMinutes: number | null;
  createdAt: string;
  publishedAt: string | null;
  _count: {
    attempts: number;
  };
};

export function ExamScheduler({ courseId }: { courseId: string }) {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("conduct");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [examsRes, students] = await Promise.all([
        fetch(`/api/exams?courseId=${courseId}`),
        getEnrolledStudents(courseId),
      ]);

      if (!examsRes.ok) throw new Error("Failed to fetch exams");

      const examsData = await examsRes.json();
      setExams(examsData.exams || []);
      setEnrolledCount(students.length);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exam session data");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateExamStatus = async (
    examId: string,
    status: "PUBLISHED" | "CLOSED"
  ) => {
    try {
      setActionLoading(examId);
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update exam status");

      toast.success(
        status === "PUBLISHED" ? "Exam session started" : "Exam session ended"
      );
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update exam status");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: ExamRecord["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return {
          label: "Live",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        };
      case "CLOSED":
        return {
          label: "Closed",
          color: "bg-slate-500/10 text-slate-600 border-slate-200",
        };
      default:
        return {
          label: "Draft",
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FlowerLoader size="md" className="text-primary" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Loading sessions...
        </p>
      </div>
    );
  }

  const liveExams = exams.filter((e) => e.status === "PUBLISHED");
  const upcomingExams = exams.filter((e) => e.status === "DRAFT");
  const pastExams = exams.filter((e) => e.status === "CLOSED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Exam Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Manage and conduct online examinations for this course.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="conduct" className="px-6">
            Conduct
          </TabsTrigger>
          <TabsTrigger value="history" className="px-6">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conduct" className="space-y-4">
          {liveExams.length === 0 && upcomingExams.length === 0 ? (
            <Card className="border-dashed py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">
                  No active or upcoming exams
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Create an exam paper in the "Paper Creation" section to start
                  a session.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {[...liveExams, ...upcomingExams].map((exam) => {
                const config = getStatusConfig(exam.status);
                const isLive = exam.status === "PUBLISHED";
                const isPending = actionLoading === exam.id;

                return (
                  <Card
                    key={exam.id}
                    className={cn(
                      "overflow-hidden border-l-4 transition-all hover:shadow-md",
                      isLive ? "border-l-emerald-500" : "border-l-amber-500"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(config.color, "font-medium")}
                            >
                              {config.label}
                            </Badge>
                            <h3 className="text-lg font-bold">{exam.title}</h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {exam.timeLimitMinutes
                                ? `${exam.timeLimitMinutes} mins`
                                : "No limit"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {exam._count.attempts} / {enrolledCount}{" "}
                              Submissions
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isLive ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateExamStatus(exam.id, "PUBLISHED")
                              }
                              disabled={!!actionLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            >
                              {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              Start Session
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateExamStatus(exam.id, "CLOSED")
                              }
                              disabled={!!actionLoading}
                              className="gap-2 shadow-sm"
                            >
                              {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                              End Session
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Preview
                          </Button>
                        </div>
                      </div>

                      {isLive && (
                        <div className="mt-6 pt-6 border-t border-dashed">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Session Progress
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(
                                (exam._count.attempts / (enrolledCount || 1)) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{
                                width: `${(exam._count.attempts / (enrolledCount || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {pastExams.length === 0 ? (
            <Card className="border-dashed py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No past exams found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Completed exams will appear here with their final metrics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastExams.map((exam) => (
                <Card
                  key={exam.id}
                  className="hover:shadow-sm transition-all border-l-4 border-l-slate-400"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{exam.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ended on{" "}
                          {exam.publishedAt
                            ? new Date(exam.publishedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {exam._count.attempts} submissions
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Detailed Results
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Paper
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
