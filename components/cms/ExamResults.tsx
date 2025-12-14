"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Check, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FlowerLoader } from "../ui/flower-loader";
import { useSession } from "next-auth/react";

type AttemptAnswer = {
  id: string;
  questionId: string;
  selectedOption?: string | null;
  answerText?: string | null;
  isCorrect?: boolean | null;
  marksAwarded?: number | null;
  feedback?: string | null;
  question: {
    id: string;
    type: "MCQ" | "ESSAY";
    questionText: string;
    sampleAnswer?: string | null;
    explanation?: string | null;
    correctAnswer?: string | null;
  };
};

type ExamAttemptRecord = {
  id: string;
  examId: string;
  studentId: string;
  studentName?: string | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  score?: number | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  exam: {
    id: string;
    title: string;
    courseName: string | null;
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
  };
  answers: AttemptAnswer[];
};

type GradeFormState = Record<
  string,
  {
    marksAwarded: number;
    feedback: string;
  }
>;

interface ExamResultsProps {
  courseId: string;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All attempts" },
  { value: "SUBMITTED", label: "Pending grading" },
  { value: "GRADED", label: "Graded" },
] as const;

export function ExamResults({ courseId }: ExamResultsProps) {
  const { data: session } = useSession();
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("ALL");
  const [gradingAttempt, setGradingAttempt] =
    useState<ExamAttemptRecord | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeFormState>({});
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/exam-attempts");
      if (!response.ok) throw new Error("Failed to load exam attempts");
      const data = await response.json();
      setAttempts(data.attempts ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load exam attempts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [courseId]);

  const filteredAttempts = useMemo(() => {
    if (statusFilter === "ALL") return attempts;
    return attempts.filter((attempt) => attempt.status === statusFilter);
  }, [attempts, statusFilter]);

  const openGradingDialog = (attempt: ExamAttemptRecord) => {
    const essays = attempt.answers.filter((a) => a.question.type === "ESSAY");
    const initialState: GradeFormState = {};
    essays.forEach((essay) => {
      initialState[essay.id] = {
        marksAwarded: essay.marksAwarded ?? 0,
        feedback: essay.feedback ?? "",
      };
    });
    setGradeForm(initialState);
    setGradingAttempt(attempt);
  };

  const handleGradeChange = (
    answerId: string,
    field: keyof GradeFormState[string],
    value: string
  ) => {
    setGradeForm((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]:
          field === "marksAwarded" ? Number.parseInt(value || "0", 10) : value,
      },
    }));
  };

  const submitGrades = async () => {
    if (!gradingAttempt) return;
    const essays = gradingAttempt.answers.filter(
      (a) => a.question.type === "ESSAY"
    );
    if (essays.length === 0) return;

    setIsSavingGrade(true);
    try {
      const payload = {
        essayMarks: essays.map((essay) => ({
          answerId: essay.id,
          marksAwarded: gradeForm[essay.id]?.marksAwarded ?? 0,
          feedback: gradeForm[essay.id]?.feedback ?? "",
        })),
        gradedById: session?.user?.id,
      };

      const response = await fetch(`/api/exam-attempts/${gradingAttempt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Failed to submit grades");

      toast.success("Essay questions graded");
      setAttempts((prev) =>
        prev.map((a) => (a.id === gradingAttempt.id ? data.attempt : a))
      );
      setGradingAttempt(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit grades"
      );
    } finally {
      setIsSavingGrade(false);
    }
  };

  const renderStatusBadge = (status: ExamAttemptRecord["status"]) => {
    switch (status) {
      case "GRADED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600">Graded</Badge>
        );
      case "SUBMITTED":
        return <Badge variant="secondary">Awaiting grading</Badge>;
      default:
        return <Badge variant="outline">In progress</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">
              Exam attempts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review submissions and grade essay questions manually.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter attempts" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchAttempts}
              disabled={loading}
            >
              {loading ? (
                <div className="text-center">
                  <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
                </div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No exam attempts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.map((attempt) => {
                    const essayPending = attempt.answers.some(
                      (a) =>
                        a.question.type === "ESSAY" && a.marksAwarded == null
                    );
                    const totalMarks = attempt.answers.reduce(
                      (sum, a) => sum + (a.marksAwarded ?? 0),
                      0
                    );

                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {attempt.studentName || attempt.studentId}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {attempt.studentId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {attempt.exam.title}
                            </span>
                            {attempt.exam.courseName ? (
                              <span className="text-xs text-muted-foreground">
                                {attempt.exam.courseName}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(attempt.status)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {attempt.status === "GRADED"
                            ? `${totalMarks}`
                            : (attempt.score ?? 0)}
                        </TableCell>
                        <TableCell>
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {essayPending ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGradingDialog(attempt)}
                            >
                              <Pencil className="mr-1 h-4 w-4" /> Grade essays
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No grading required
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {gradingAttempt && (
        <Dialog
          open={Boolean(gradingAttempt)}
          onOpenChange={(open) => !open && setGradingAttempt(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Grade essay responses</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="rounded-md border p-4">
                <p className="font-semibold">{gradingAttempt.exam.title}</p>
                <p className="text-sm text-muted-foreground">
                  Student:{" "}
                  {gradingAttempt.studentName || gradingAttempt.studentId}
                </p>
              </div>
              <div className="space-y-4">
                {gradingAttempt.answers
                  .filter((a) => a.question.type === "ESSAY")
                  .map((a) => (
                    <div key={a.id} className="space-y-3 rounded-md border p-4">
                      <p className="font-medium">{a.question.questionText}</p>
                      {a.question.sampleAnswer && (
                        <details className="mt-2 text-sm text-muted-foreground">
                          <summary>View sample answer</summary>
                          <p className="mt-2 whitespace-pre-wrap">
                            {a.question.sampleAnswer}
                          </p>
                        </details>
                      )}
                      <div className="space-y-2">
                        <Label>Student response</Label>
                        <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                          {a.answerText || "No response"}
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                        <div>
                          <Label htmlFor={`${a.id}-marks`}>Marks awarded</Label>
                          <Input
                            id={`${a.id}-marks`}
                            type="number"
                            min={0}
                            value={gradeForm[a.id]?.marksAwarded ?? 0}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleGradeChange(
                                a.id,
                                "marksAwarded",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${a.id}-feedback`}>
                            Feedback (optional)
                          </Label>
                          <Textarea
                            id={`${a.id}-feedback`}
                            rows={3}
                            value={gradeForm[a.id]?.feedback ?? ""}
                            onChange={(e) =>
                              handleGradeChange(
                                a.id,
                                "feedback",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGradingAttempt(null)}
                >
                  Cancel
                </Button>
                <Button onClick={submitGrades} disabled={isSavingGrade}>
                  {isSavingGrade ? (
                    <div className="text-center">
                      <FlowerLoader
                        size="md"
                        className="text-[#A41FC5] mx-auto"
                      />
                    </div>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Submit grades
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
