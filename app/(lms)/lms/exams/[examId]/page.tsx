"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
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
  course?: {
    name: string;
    teacherName: string;
  } | null;
  createdBy?: {
    name: string;
  } | null;
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
  const { data: session } = useSession();
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingMarks, setCheckingMarks] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
        router.push("/lms");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, router]);

  useEffect(() => {
    if (session?.user?.id) {
      setStudentId(session.user.id);
    }

    if (session?.user?.name) {
      setStudentName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (!exam || result) return undefined;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [exam, result]);

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

  const currentEntry = exam.questions[currentQuestionIndex];
  const currentQuestion = currentEntry.question;
  const currentOptions = parseOptions(currentQuestion.options);
  const evaluationMap = new Map(
    result?.evaluation.map((entry) => [entry.questionId, entry])
  );
  const currentEvaluation = evaluationMap.get(currentEntry.questionId);

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

  const formattedElapsed = new Date(elapsedSeconds * 1000)
    .toISOString()
    .substring(11, 19);

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= exam.questions.length) return;
    setCurrentQuestionIndex(index);
  };

  const studentIdLocked = Boolean(result) || Boolean(session?.user?.id);
  const studentNameLocked = Boolean(result) || Boolean(session?.user?.name);

  return (
    <div className="min-h-screen space-y-8 bg-muted/10 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="overflow-hidden rounded-3xl border border-muted/50 bg-linear-to-r from-primary/10 via-background to-secondary/10 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:gap-6">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              {exam.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                Course: {exam.course?.name ?? "Not assigned"}
              </Badge>
              <Badge variant="outline">
                Teacher:{" "}
                {exam.course?.teacherName ?? exam.createdBy?.name ?? "TBD"}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
              <div className="rounded-2xl border bg-background/80 px-4 py-3 text-left shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Questions
                </p>
                <p className="text-2xl font-semibold">
                  {exam.questions.length}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 px-4 py-3 text-left shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total marks
                </p>
                <p className="text-2xl font-semibold">{totalMarks}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 px-4 py-3 text-left shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Time spent
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {formattedElapsed}
                </p>
              </div>
            </div>
            {exam.description ? (
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                {exam.description}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-muted/40 bg-background/80 shadow-lg backdrop-blur">
          <CardHeader className="border-b ">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  value={studentId}
                  disabled={studentIdLocked}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder={
                    studentIdLocked
                      ? "Loaded from your account"
                      : "Enter your student ID"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-name">Student name</Label>
                <Input
                  id="student-name"
                  value={studentName}
                  disabled={studentNameLocked}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder={
                    studentNameLocked
                      ? "Loaded from your account"
                      : "Enter your full name"
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr,minmax(300px,350px)] lg:items-start">
              <div className="space-y-6">
                <Card className="rounded-3xl border border-muted/60 shadow-sm">
                  <CardHeader className="border-b bg-muted/5 space-y-1">
                    <h2 className="text-lg font-semibold">Quotations</h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">
                          Question {currentQuestionIndex + 1} of{" "}
                          {exam.questions.length}
                        </Badge>
                        <Badge variant="outline">
                          {currentEntry.marks} marks
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentQuestion.type === "MCQ"
                          ? "Select one option"
                          : "Write your answer"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-muted/50 bg-background p-4">
                      <p className="text-base font-medium leading-relaxed">
                        {currentQuestion.questionText}
                      </p>
                    </div>

                    {currentQuestion.type === "MCQ" ? (
                      <div className="space-y-3">
                        {currentOptions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Options unavailable for this question.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {currentOptions.map((option) => {
                              const studentResponse =
                                answers[currentEntry.questionId];
                              return (
                                <label
                                  key={`${currentEntry.questionId}-${option}`}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                                    studentResponse?.selectedOption === option
                                      ? "border-primary bg-primary/8"
                                      : "border-muted/40 hover:bg-muted/30"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    className="h-4 w-4"
                                    checked={
                                      studentResponse?.selectedOption === option
                                    }
                                    onChange={() =>
                                      handleSelectOption(
                                        currentEntry.questionId,
                                        option
                                      )
                                    }
                                    disabled={Boolean(result)}
                                  />
                                  <span>{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        {result && currentEvaluation && (
                          <div className="rounded-lg border border-muted/50 bg-muted/30 p-4 text-sm">
                            <p>
                              {currentEvaluation.isCorrect ? (
                                <span className="font-semibold text-emerald-600">
                                  ✓ Correct!
                                </span>
                              ) : (
                                <span className="font-semibold text-destructive">
                                  ✗ Incorrect
                                </span>
                              )}
                            </p>
                            <p className="mt-2 text-muted-foreground">
                              <span className="font-medium">
                                Correct answer:
                              </span>{" "}
                              {currentEvaluation.correctAnswer ||
                                "Not provided"}
                            </p>
                            {currentEvaluation.explanation && (
                              <p className="mt-2 text-muted-foreground">
                                <span className="font-medium">
                                  Explanation:
                                </span>{" "}
                                {currentEvaluation.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your answer here..."
                          value={
                            answers[currentEntry.questionId]?.answerText || ""
                          }
                          onChange={(event) =>
                            handleEssayChange(
                              currentEntry.questionId,
                              event.target.value
                            )
                          }
                          rows={5}
                          disabled={Boolean(result)}
                          className="rounded-lg"
                        />
                        {result && (
                          <p className="text-sm text-muted-foreground">
                            Essay questions will be graded by your teacher.
                            Check back for final marks.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="border-t border-dashed border-muted/40 pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              goToQuestion(currentQuestionIndex - 1)
                            }
                            disabled={currentQuestionIndex === 0}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              goToQuestion(currentQuestionIndex + 1)
                            }
                            disabled={
                              currentQuestionIndex === exam.questions.length - 1
                            }
                          >
                            Next
                          </Button>
                        </div>
                        {!result ? (
                          <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Submit exam"
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {result ? (
                      <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-400/10 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 p-2">
                            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                Exam submitted successfully
                              </h3>
                              <div className="mt-1.5 text-sm text-emerald-800 dark:text-emerald-200">
                                {essaysPending ? (
                                  <>
                                    <p>
                                      Auto-graded score:{" "}
                                      {result.attempt.score ?? 0}
                                    </p>
                                    <p className="mt-1">
                                      Essay questions will be added once graded.
                                    </p>
                                  </>
                                ) : (
                                  <p>
                                    Final score: {finalMarks} / {totalMarks}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-600/30 bg-background hover:bg-emerald-500/10 dark:border-emerald-400/30 dark:hover:bg-emerald-400/10"
                              >
                                <Link href="/lms">Return to LMS</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 lg:min-w-fit">
                <Card className="rounded-2xl border border-muted/60 shadow-sm">
                  <CardHeader className="border-b bg-muted/5">
                    <CardTitle className="text-lg">
                      Question navigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="grid grid-cols-3 gap-2">
                      {exam.questions.map((entry, index) => {
                        const answered = Boolean(
                          answers[entry.questionId]?.selectedOption ||
                            answers[entry.questionId]?.answerText
                        );

                        const isCurrent = index === currentQuestionIndex;

                        return (
                          <Button
                            key={entry.id}
                            variant={
                              isCurrent
                                ? "default"
                                : answered
                                  ? "secondary"
                                  : "outline"
                            }
                            size="sm"
                            className="w-full h-10 rounded-lg text-sm font-medium"
                            onClick={() => goToQuestion(index)}
                            disabled={Boolean(result)}
                          >
                            {index + 1}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground pt-2 border-t border-muted/40">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>Current</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
                        <span>Answered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full border border-muted-foreground" />
                        <span>Not answered</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
