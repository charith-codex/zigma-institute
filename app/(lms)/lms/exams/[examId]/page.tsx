"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Trophy } from "lucide-react";

interface ExamQuestion {
  id: string;
  order: number;
  marks: number;
  questionId: string;
  question: {
    id: string;
    type: "MCQ" | "ESSAY";
    questionText: string;
    options?: unknown;
    correctAnswer?: string | null;
    explanation?: string | null;
    sampleAnswer?: string | null;
  };
}

interface ExamPayload {
  id: string;
  title: string;
  lessonTitle: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  questions: ExamQuestion[];
}

type AnswerDraft = {
  selectedOption?: string;
  answerText?: string;
};

interface EvaluationResult {
  answerId: string;
  questionId: string;
  type: "MCQ" | "ESSAY";
  isCorrect?: boolean | null;
  marksAwarded?: number | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  sampleAnswer?: string | null;
  studentAnswer: string;
}

interface AttemptAnswerRecord {
  id: string;
  questionId: string;
  selectedOption?: string | null;
  answerText?: string | null;
  isCorrect?: boolean | null;
  marksAwarded?: number | null;
  question: {
    id: string;
    type: "MCQ" | "ESSAY";
    questionText: string;
    correctAnswer?: string | null;
    explanation?: string | null;
    sampleAnswer?: string | null;
  };
}

interface AttemptRecord {
  id: string;
  examId: string;
  studentId: string;
  studentName?: string | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  score?: number | null;
  submittedAt?: string | null;
  answers: AttemptAnswerRecord[];
}

const parseOptions = (value: unknown): string[] => {
  if (!value || !Array.isArray(value)) return [];
  return value.map((option) => {
    if (typeof option === "string") return option;
    if (option && typeof option === "object" && "text" in option) {
      return String((option as { text?: string }).text ?? "");
    }
    return "";
  });
};

const buildEvaluation = (attempt: AttemptRecord): EvaluationResult[] =>
  attempt.answers.map((answer) => ({
    answerId: answer.id,
    questionId: answer.questionId,
    type: answer.question.type,
    isCorrect: answer.isCorrect,
    marksAwarded: answer.marksAwarded,
    correctAnswer: answer.question.correctAnswer,
    explanation: answer.question.explanation,
    sampleAnswer: answer.question.sampleAnswer,
    studentAnswer: answer.answerText ?? answer.selectedOption ?? "",
  }));

export default function ExamAttemptPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<ExamPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingMarks, setCheckingMarks] = useState(false);
  const [result, setResult] = useState<{
    attempt: AttemptRecord;
    evaluation: EvaluationResult[];
  } | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/exams/${examId}`);
        if (!response.ok) {
          throw new Error("Exam not found");
        }
        const data = await response.json();
        const examData: ExamPayload = data.exam;
        setExam(examData);
        const initialAnswers: Record<string, AnswerDraft> = {};
        examData.questions.forEach((entry) => {
          initialAnswers[entry.questionId] = {};
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Unable to load exam"
        );
        router.push("/lms/exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, router]);

  const totalMarks = useMemo(() => {
    if (!exam) return 0;
    return exam.questions.reduce((sum, entry) => sum + entry.marks, 0);
  }, [exam]);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: option,
      },
    }));
  };

  const handleEssayChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answerText: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    if (!studentId.trim()) {
      toast.error("Enter your student ID before submitting");
      return;
    }

    const unanswered = exam.questions.filter((entry) => {
      const response = answers[entry.questionId];
      if (entry.question.type === "MCQ") {
        return !response?.selectedOption;
      }
      return false;
    });

    if (unanswered.length > 0) {
      toast.error("Answer all multiple-choice questions before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        examId,
        studentId: studentId.trim(),
        studentName: studentName.trim() || undefined,
        answers: exam.questions.map((entry) => ({
          questionId: entry.questionId,
          type: entry.question.type,
          selectedOption:
            entry.question.type === "MCQ"
              ? (answers[entry.questionId]?.selectedOption ?? "")
              : undefined,
          answerText:
            entry.question.type === "ESSAY"
              ? (answers[entry.questionId]?.answerText ?? "")
              : undefined,
        })),
      };

      const response = await fetch("/api/exam-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit exam");
      }

      const attempt: AttemptRecord = data.attempt;
      const evaluation: EvaluationResult[] =
        data.evaluation ?? buildEvaluation(attempt);
      setResult({ attempt, evaluation });
      toast.success("Exam submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to submit exam"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const refreshResults = async () => {
    if (!studentId.trim()) {
      toast.error("Enter your student ID to check marks");
      return;
    }

    try {
      setCheckingMarks(true);
      const response = await fetch(
        `/api/exam-attempts?examId=${examId}&studentId=${encodeURIComponent(studentId.trim())}`
      );
      if (!response.ok) {
        throw new Error("Unable to retrieve latest marks");
      }

      const data = await response.json();
      const attempt: AttemptRecord | undefined = data.attempts?.[0];

      if (!attempt) {
        toast.error("No submission found for this exam");
        return;
      }

      setResult({ attempt, evaluation: buildEvaluation(attempt) });
      toast.success("Marks refreshed");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to refresh marks"
      );
    } finally {
      setCheckingMarks(false);
    }
  };

  if (loading || !exam) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const evaluationMap = new Map(
    result?.evaluation.map((entry) => [entry.questionId, entry])
  );
  const finalMarks = result
    ? result.attempt.answers.reduce(
        (sum, answer) => sum + (answer.marksAwarded ?? 0),
        0
      )
    : 0;
  const essaysPending = result
    ? result.attempt.answers.some(
        (answer) =>
          answer.question.type === "ESSAY" && answer.marksAwarded == null
      )
    : false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">{exam.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Lesson: {exam.lessonTitle}</Badge>
            <Badge variant="secondary">Total marks: {totalMarks}</Badge>
          </div>
          {exam.description && (
            <p className="text-sm text-muted-foreground">{exam.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                value={studentId}
                disabled={Boolean(result)}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="Enter your student number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-name">Name (optional)</Label>
              <Input
                id="student-name"
                value={studentName}
                disabled={Boolean(result)}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="space-y-6">
            {exam.questions.map((entry, index) => {
              const question = entry.question;
              const options = parseOptions(question.options);
              const evaluation = evaluationMap.get(entry.questionId);
              const studentResponse = answers[entry.questionId] ?? {};

              return (
                <div key={entry.id} className="space-y-3 rounded-md border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Question {index + 1}</Badge>
                      <Badge variant="outline">{entry.marks} marks</Badge>
                    </div>
                    <Badge variant="outline">{question.type}</Badge>
                  </div>
                  <p className="font-medium">{question.questionText}</p>

                  {question.type === "MCQ" ? (
                    <div className="space-y-2">
                      {options.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Options unavailable for this question.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {options.map((option) => (
                            <label
                              key={`${entry.questionId}-${option}`}
                              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition ${
                                studentResponse.selectedOption === option
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              <input
                                type="radio"
                                className="h-4 w-4"
                                checked={
                                  studentResponse.selectedOption === option
                                }
                                onChange={() =>
                                  handleSelectOption(entry.questionId, option)
                                }
                                disabled={Boolean(result)}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {result && evaluation && (
                        <div className="rounded-md bg-muted/50 p-3 text-sm">
                          <p>
                            {evaluation.isCorrect ? (
                              <span className="font-semibold text-emerald-600">
                                Correct!
                              </span>
                            ) : (
                              <span className="font-semibold text-destructive">
                                Incorrect.
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            Correct answer:{" "}
                            {evaluation.correctAnswer || "Not provided"}
                          </p>
                          {evaluation.explanation && (
                            <p className="mt-2 text-muted-foreground">
                              Explanation: {evaluation.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your answer"
                        value={studentResponse.answerText || ""}
                        onChange={(event) =>
                          handleEssayChange(
                            entry.questionId,
                            event.target.value
                          )
                        }
                        rows={6}
                        disabled={Boolean(result)}
                      />
                      {result && (
                        <p className="text-sm text-muted-foreground">
                          Essay questions will be graded by your teacher. Check
                          back for final marks.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!result ? (
            <Button
              className="w-full md:w-auto"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit exam"
              )}
            </Button>
          ) : (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <Trophy className="h-5 w-5" />
                <p className="font-semibold">Exam submitted successfully</p>
              </div>
              <p className="mt-2 text-sm text-emerald-700">
                {essaysPending
                  ? `Auto-graded score: ${result.attempt.score ?? 0}. Essay questions will be added once graded.`
                  : `Final score: ${finalMarks}`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshResults}
                  disabled={checkingMarks}
                >
                  {checkingMarks ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : null}
                  Check latest marks
                </Button>
                <Button variant="link" asChild className="px-0">
                  <Link href="/lms/exams">Return to exam list</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
