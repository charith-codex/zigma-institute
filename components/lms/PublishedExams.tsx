"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { FlowerLoader } from "../ui/flower-loader";

export type ExamSummary = {
  id: string;
  title: string;
  course?: { name: string } | null;
  instructions?: string | null;
  timeLimitMinutes?: number | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  questions: Array<{ id: string; marks: number }>;
  createdAt: string;
  publishedAt?: string | null;
};

interface PublishedExamsProps {
  heading?: string;
  description?: string;
}

export function PublishedExams({ heading, description }: PublishedExamsProps) {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/exams?status=PUBLISHED");
        if (!response.ok) {
          throw new Error("Failed to load published exams");
        }
        const data = await response.json();
        setExams((data.exams as ExamSummary[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-2xl font-semibold">
            {heading ?? "Available exam papers"}
          </CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center">
            <FlowerLoader size="lg" className="text-[#A41FC5] mx-auto" />
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No published exams yet. Check back later.
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="border border-border/70">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {exam.title}
                    </CardTitle>
                    {exam.course?.name ? (
                      <p className="text-sm text-muted-foreground">
                        Course: {exam.course.name}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <ShieldCheck className="h-4 w-4" /> Published
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exam.instructions ? (
                    <p className="text-sm text-muted-foreground">
                      {exam.instructions}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">
                      Questions: {exam.questions.length}
                    </Badge>
                    <Badge variant="outline">
                      Total marks:{" "}
                      {exam.questions.reduce(
                        (sum, question) => sum + question.marks,
                        0
                      )}
                    </Badge>
                    {exam.timeLimitMinutes ? (
                      <Badge variant="outline">
                        Time limit: {exam.timeLimitMinutes} mins
                      </Badge>
                    ) : null}
                    {exam.publishedAt ? (
                      <span>
                        Published: {new Date(exam.publishedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <Button asChild className="mt-2 w-full md:w-auto">
                    <Link href={`/lms/exams/${exam.id}`}>Start exam</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
