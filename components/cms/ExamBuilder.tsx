"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FlowerLoader } from "../ui/flower-loader";
import { cn } from "@/lib/utils";

const normalizeOptions = (value: unknown): string[] => {
  if (!value || !Array.isArray(value)) return [];

  return value.map((option) => {
    if (typeof option === "string") return option;
    if (option && typeof option === "object" && "text" in option) {
      return String((option as { text?: string }).text ?? "");
    }
    return "";
  });
};

type QuestionRecord = {
  id: string;
  lesson?: { title: string };
  type: "MCQ" | "ESSAY";
  questionText: string;
  options?: unknown;
  correctAnswer?: string | null;
  explanation?: string | null;
  sampleAnswer?: string | null;
  difficulty?: string | null;
};

type ExamQuestionRecord = {
  id: string;
  order: number;
  marks: number;
  questionId: string;
  question: QuestionRecord;
};

type ExamRecord = {
  id: string;
  title: string;
  courseId: string | null;
  course?: { name: string } | null;
  instructions?: string | null;
  timeLimitMinutes?: number | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  createdAt: string;
  publishedAt?: string | null;
  questions: ExamQuestionRecord[];
};

type SelectedQuestion = {
  question: QuestionRecord;
  marks: number;
};

type ExamFormState = {
  title: string;
  instructions: string;
  timeLimitMinutes: string;
  publish: boolean;
};

const DEFAULT_FORM: ExamFormState = {
  title: "",
  instructions: "",
  timeLimitMinutes: "",
  publish: false,
};

export function ExamBuilder({
  courseId,
  initialView = "all",
}: {
  courseId: string;
  initialView?: "all" | "creation" | "list";
}) {
  const { data: session } = useSession();
  const [questionBank, setQuestionBank] = useState<QuestionRecord[]>([]);
  const [questionLessonFilter, setQuestionLessonFilter] = useState("all");
  const [selectedQuestions, setSelectedQuestions] = useState<
    Record<string, SelectedQuestion>
  >({});
  const [examForm, setExamForm] = useState<ExamFormState>(DEFAULT_FORM);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    questions: false,
    exams: false,
  });
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(
    new Set()
  );
  const [expandedExamIds, setExpandedExamIds] = useState<Set<string>>(
    new Set()
  );
  const [currentExamsPage, setCurrentExamsPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, questions: true }));
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch question bank");
      }
      const data = await response.json();
      setQuestionBank(data.questions ?? []);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to fetch questions"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, questions: false }));
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, exams: true }));
      const response = await fetch(
        `/api/exams?${new URLSearchParams({ courseId })}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch exams");
      }
      const data = await response.json();
      setExams(data.exams ?? []);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to fetch exams"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, exams: false }));
    }
  }, [courseId]);

  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, [courseId, fetchExams, fetchQuestions]);

  const lessons = useMemo(() => {
    const values = new Set(
      questionBank
        .map((question) => question.lesson?.title)
        .filter(Boolean) as string[]
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [questionBank]);

  const filteredQuestions = useMemo(() => {
    if (questionLessonFilter === "all" || !questionLessonFilter)
      return questionBank;
    return questionBank.filter(
      (question) => question.lesson?.title === questionLessonFilter
    );
  }, [questionBank, questionLessonFilter]);

  const totalMarks = useMemo(() => {
    return Object.values(selectedQuestions).reduce(
      (sum, entry) => sum + entry.marks,
      0
    );
  }, [selectedQuestions]);

  const toggleQuestionSelection = (question: QuestionRecord) => {
    setSelectedQuestions((prev) => {
      if (prev[question.id]) {
        const next = { ...prev };
        delete next[question.id];
        return next;
      }

      return {
        ...prev,
        [question.id]: {
          question,
          marks: question.type === "MCQ" ? 1 : 5,
        },
      };
    });
  };

  const updateMarks = (questionId: string, marks: number) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        marks,
      },
    }));
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const toggleExamExpansion = (examId: string) => {
    setExpandedExamIds((prev) => {
      const next = new Set(prev);
      if (next.has(examId)) {
        next.delete(examId);
      } else {
        next.add(examId);
      }
      return next;
    });
  };

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [questionLessonFilter]);

  const totalExamsPages = Math.ceil(exams.length / ITEMS_PER_PAGE);
  const paginatedExams = exams.slice(
    (currentExamsPage - 1) * ITEMS_PER_PAGE,
    currentExamsPage * ITEMS_PER_PAGE
  );

  // Reset exam page when courseId changes
  useEffect(() => {
    setCurrentExamsPage(1);
  }, [courseId]);

  const handleCreateExam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!examForm.title.trim()) {
      toast.error("Exam title is required");
      return;
    }

    if (!courseId) {
      toast.error("Select a course before creating an exam");
      return;
    }

    const questionEntries = Object.entries(selectedQuestions);
    if (questionEntries.length === 0) {
      toast.error("Select at least one question for the exam");
      return;
    }

    const trimmedTimeLimit = examForm.timeLimitMinutes.trim();
    const hasTimeLimit = trimmedTimeLimit.length > 0;
    let parsedTimeLimit: number | undefined;

    if (hasTimeLimit) {
      parsedTimeLimit = Number.parseInt(trimmedTimeLimit, 10);
      if (Number.isNaN(parsedTimeLimit) || parsedTimeLimit <= 0) {
        toast.error("Enter a valid time limit in minutes");
        return;
      }

      if (parsedTimeLimit > 600) {
        toast.error("Time limit cannot exceed 600 minutes");
        return;
      }
    }

    setIsSavingExam(true);

    try {
      const payload = {
        title: examForm.title.trim(),
        courseId,
        instructions: examForm.instructions.trim() || undefined,
        timeLimitMinutes: parsedTimeLimit,
        createdById: session?.user?.id,
        publish: examForm.publish,
        questions: questionEntries.map(([questionId, entry], index) => ({
          questionId,
          order: index,
          marks: entry.marks,
        })),
      };

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create exam");
      }

      toast.success(
        examForm.publish ? "Exam published" : "Exam saved as draft"
      );
      setSelectedQuestions({});
      setExamForm(DEFAULT_FORM);
      fetchExams();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to create exam"
      );
    } finally {
      setIsSavingExam(false);
    }
  };

  const setExamStatus = async (examId: string, publish: boolean) => {
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publish }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error ?? `Failed to ${publish ? "publish" : "unpublish"} exam`
        );
      }

      toast.success(
        `Exam ${publish ? "published" : "unpublished"} successfully`
      );
      fetchExams();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to ${publish ? "publish" : "unpublish"} exam`
      );
    }
  };

  const deleteExam = async () => {
    if (!examToDelete) return;

    try {
      const response = await fetch(`/api/exams/${examToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete exam");
      }

      toast.success("Exam deleted successfully");
      fetchExams();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to delete exam"
      );
    } finally {
      setExamToDelete(null);
    }
  };

  const showCreation = initialView === "all" || initialView === "creation";
  const showList = initialView === "all" || initialView === "list";

  return (
    <div
      className={cn(
        "grid gap-6",
        showCreation && showList ? "lg:grid-cols-[2fr,1fr]" : "grid-cols-1"
      )}
    >
      {showCreation && (
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleCreateExam}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold pb-3">
                  Exam Paper Creation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exam-title">Exam title</Label>
                  <Input
                    id="exam-title"
                    value={examForm.title}
                    onChange={(event) =>
                      setExamForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Mid-term assessment"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exam-time-limit">
                      Time limit (minutes)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Optional
                    </span>
                  </div>
                  <Input
                    id="exam-time-limit"
                    type="number"
                    min={1}
                    max={600}
                    inputMode="numeric"
                    value={examForm.timeLimitMinutes}
                    onChange={(event) =>
                      setExamForm((prev) => ({
                        ...prev,
                        timeLimitMinutes: event.target.value,
                      }))
                    }
                    placeholder="e.g. 90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam-description">Exam instructions</Label>
                  <Textarea
                    id="exam-description"
                    value={examForm.instructions}
                    onChange={(event) =>
                      setExamForm((prev) => ({
                        ...prev,
                        instructions: event.target.value,
                      }))
                    }
                    placeholder="Share any rules, calculator restrictions, or submission notes"
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">Publish immediately</p>
                    <p className="text-xs text-muted-foreground">
                      Publish now to make the exam visible to students.
                    </p>
                  </div>
                  <Switch
                    checked={examForm.publish}
                    onCheckedChange={(checked) =>
                      setExamForm((prev) => ({ ...prev, publish: checked }))
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="text-sm text-muted-foreground">
                  Selected questions: {Object.keys(selectedQuestions).length} |
                  Total marks: {totalMarks}
                </div>
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                  disabled={isSavingExam}
                >
                  {isSavingExam ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : examForm.publish ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {examForm.publish ? "Create & publish exam" : "Save exam"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Select questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-sm font-medium">
                    Filter by lesson
                  </Label>
                  <Select
                    value={questionLessonFilter}
                    onValueChange={setQuestionLessonFilter}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="All lessons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All lessons</SelectItem>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson} value={lesson}>
                          {lesson}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={fetchQuestions}
                    disabled={isLoading.questions}
                  >
                    {isLoading.questions ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>

                {Object.keys(selectedQuestions).length > 0 && (
                  <div className="flex items-center gap-3 bg-green-500/20 px-4 py-2 rounded-lg border border-green-600/60">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-bold leading-none">
                        Total Marks =
                      </span>
                      <span className="text-xl font-bold text-red-500">
                        {totalMarks}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No questions available. Create questions first.
                  </div>
                ) : (
                  <>
                    {paginatedQuestions.map((question) => {
                      const options = normalizeOptions(question.options);
                      const isSelected = Boolean(
                        selectedQuestions[question.id]
                      );
                      const isExpanded = expandedQuestionIds.has(question.id);
                      return (
                        <div
                          key={question.id}
                          className={cn(
                            "space-y-3 rounded-md border p-4 transition",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {question.lesson?.title ?? "General"}
                              </Badge>
                              <Badge variant="secondary">{question.type}</Badge>
                              {question.difficulty && (
                                <Badge variant="outline">
                                  {question.difficulty}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleQuestionExpansion(question.id)
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                )}
                                {isExpanded ? "Hide" : "Details"}
                              </Button>
                              <Button
                                type="button"
                                variant={isSelected ? "secondary" : "outline"}
                                size="sm"
                                onClick={() =>
                                  toggleQuestionSelection(question)
                                }
                              >
                                {isSelected ? "Remove" : "Select"}
                              </Button>
                            </div>
                          </div>
                          <p className="font-medium">{question.questionText}</p>

                          {isExpanded && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                              {question.type === "MCQ" &&
                                options.length > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold">
                                      Options
                                    </Label>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      {options.map((option, index) => (
                                        <li
                                          key={`${question.id}-option-${index}`}
                                          className={cn(
                                            "p-2 rounded border bg-background",
                                            option === question.correctAnswer &&
                                              "border-green-500 bg-green-500/40"
                                          )}
                                        >
                                          <span className="font-medium mr-2">
                                            {String.fromCharCode(65 + index)}.
                                          </span>
                                          {option}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              {question.type === "ESSAY" &&
                                question.sampleAnswer && (
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold">
                                      Sample Answer
                                    </Label>
                                    <p className="text-sm p-3 rounded border bg-background whitespace-pre-wrap">
                                      {question.sampleAnswer}
                                    </p>
                                  </div>
                                )}
                              {isSelected && (
                                <div className="space-y-2 max-w-[200px]">
                                  <Label
                                    htmlFor={`${question.id}-marks`}
                                    className="text-sm font-semibold"
                                  >
                                    Marks awarded
                                  </Label>
                                  <Input
                                    id={`${question.id}-marks`}
                                    type="number"
                                    min={1}
                                    value={
                                      selectedQuestions[question.id]?.marks ?? 1
                                    }
                                    onChange={(event) =>
                                      updateMarks(
                                        question.id,
                                        Number.parseInt(
                                          event.target.value || "1",
                                          10
                                        )
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredQuestions.length
                          )}{" "}
                          of {filteredQuestions.length} questions
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showList && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Exam papers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading.exams ? (
                <div className="text-center">
                  <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
                </div>
              ) : exams.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No exam papers yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedExams.map((exam) => {
                    const isExpanded = expandedExamIds.has(exam.id);
                    return (
                      <div
                        key={exam.id}
                        className="space-y-3 rounded-md border p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex-1 min-w-[200px]">
                            <h3 className="text-lg font-semibold">
                              {exam.title}
                            </h3>
                            {exam.course?.name ? (
                              <p className="text-sm text-muted-foreground">
                                Course: {exam.course.name}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExamExpansion(exam.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              )}
                              {isExpanded ? "Hide" : "View"}
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setExamToDelete(exam.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            {exam.status !== "PUBLISHED" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExamStatus(exam.id, true)}
                              >
                                Publish
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => setExamStatus(exam.id, false)}
                              >
                                Revert to Draft
                              </Button>
                            )}
                          </div>
                        </div>
                        {exam.instructions && (
                          <p className="text-sm text-muted-foreground">
                            {exam.instructions}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </span>
                          <Badge
                            variant={
                              exam.status === "PUBLISHED"
                                ? "default"
                                : "outline"
                            }
                          >
                            {exam.status}
                          </Badge>
                          <Badge variant="secondary">
                            Questions: {exam.questions.length}
                          </Badge>
                          {exam.timeLimitMinutes ? (
                            <Badge variant="outline">
                              Time limit: {exam.timeLimitMinutes} mins
                            </Badge>
                          ) : null}
                          <Badge variant="outline">
                            Total marks:{" "}
                            {exam.questions.reduce(
                              (sum, entry) => sum + entry.marks,
                              0
                            )}
                          </Badge>
                        </div>
                        {isExpanded && (
                          <div className="space-y-2 text-sm pt-3 border-t">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              Questions List
                            </p>
                            {exam.questions.map((entry, index) => (
                              <div
                                key={entry.id}
                                className="rounded-md bg-muted/40 p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">
                                    Q{index + 1}. {entry.question.questionText}
                                  </p>
                                  <Badge variant="outline">
                                    {entry.marks} marks
                                  </Badge>
                                </div>
                                {entry.question.type === "MCQ" && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Correct answer:{" "}
                                    <span className="font-semibold text-green-600">
                                      {entry.question.correctAnswer}
                                    </span>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {totalExamsPages > 1 && (
                    <div className="flex flex-col gap-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground text-center">
                        Showing {(currentExamsPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(
                          currentExamsPage * ITEMS_PER_PAGE,
                          exams.length
                        )}{" "}
                        of {exams.length} papers
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentExamsPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentExamsPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalExamsPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentExamsPage === page
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentExamsPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentExamsPage((p) =>
                              Math.min(totalExamsPages, p + 1)
                            )
                          }
                          disabled={currentExamsPage === totalExamsPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog
        open={!!examToDelete}
        onOpenChange={(open) => !open && setExamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              exam paper and all of its associated questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteExam}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
