"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ChevronRight,
  Edit,
  Loader2,
  MoreVertical,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLessons, useStudyMaterials } from "@/hooks/useData";

const difficultyOptions = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

type Difficulty = (typeof difficultyOptions)[number]["value"];
type QuestionType = "MCQ" | "ESSAY";

type StoredQuestion = {
  id: string;
  lessonId: string;
  lesson?: { title: string };
  type: QuestionType;
  questionText: string;
  options?: { id?: number; text?: string }[] | string[] | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  sampleAnswer?: string | null;
  difficulty?: Difficulty | null;
  createdAt: string;
};

type DraftQuestion = {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sampleAnswer: string;
  difficulty: Difficulty;
  sourceFileUrl?: string;
};

type GeneratedQuestion = DraftQuestion;

type ManualFormState = {
  lessonId: string;
  question: DraftQuestion;
};

type AiFormState = {
  lessonId: string;
  difficulty: Difficulty;
  mcqCount: number;
  essayCount: number;
  studyMaterialId: string;
  customPrompt: string;
};

const createEmptyQuestion = (type: QuestionType): DraftQuestion => ({
  id: crypto.randomUUID(),
  type,
  questionText: "",
  options: type === "MCQ" ? ["", "", "", ""] : [],
  correctAnswer: "",
  explanation: "",
  sampleAnswer: "",
  difficulty: "MEDIUM",
});

const normalizeOptions = (value: StoredQuestion["options"]): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((option) => {
      if (typeof option === "string") {
        return option;
      }

      if (option && typeof option === "object" && "text" in option) {
        return String(option.text ?? "");
      }

      return "";
    });
  }

  return [];
};

export interface QuestionCreationProps {
  courseId?: string;
  initialView?: "creation" | "bank";
}

export function QuestionCreation({
  courseId,
  initialView = "creation",
}: QuestionCreationProps) {
  const { data: session } = useSession();
  const { lessons, loading: lessonsLoading } = useLessons(courseId);
  const [manualForm, setManualForm] = useState<ManualFormState>(() => ({
    lessonId: "",
    question: createEmptyQuestion("MCQ"),
  }));
  const [savingManual, setSavingManual] = useState(false);

  const [aiForm, setAiForm] = useState<AiFormState>({
    lessonId: "",
    difficulty: "MEDIUM",
    mcqCount: 3,
    essayCount: 1,
    studyMaterialId: "",
    customPrompt: "",
  });
  const {
    materials: studyMaterials,
    loading: materialsLoading,
    error: materialsError,
  } = useStudyMaterials(aiForm.lessonId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [aiMetadata, setAiMetadata] = useState<{
    lessonId: string;
    lessonTitle: string;
    difficulty: Difficulty;
    sourceFileName?: string;
  } | null>(null);

  const [questionBank, setQuestionBank] = useState<StoredQuestion[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [lessonFilter, setLessonFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(
    new Set()
  );
  const ITEMS_PER_PAGE = 5;

  const [editingQuestion, setEditingQuestion] = useState<StoredQuestion | null>(
    null
  );
  const [editForm, setEditForm] = useState<ManualFormState | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredQuestions = useMemo(() => {
    let result = questionBank;
    if (lessonFilter !== "all" && lessonFilter.trim()) {
      result = questionBank.filter(
        (question) =>
          question.lessonId === lessonFilter ||
          question.lesson?.title
            .toLowerCase()
            .includes(lessonFilter.toLowerCase())
      );
    }
    return result;
  }, [lessonFilter, questionBank]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [lessonFilter]);

  const toggleQuestionExpansion = (id: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const uniqueLessons = useMemo(() => {
    const lessonMap = new Map<string, string>();
    questionBank.forEach((q) => {
      if (q.lessonId && q.lesson?.title) {
        lessonMap.set(q.lessonId, q.lesson.title);
      }
    });
    return Array.from(lessonMap.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [questionBank]);

  const refreshQuestionBank = async () => {
    try {
      setQuestionLoading(true);
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }

      const data = await response.json();
      setQuestionBank(data.questions ?? []);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load questions. Please retry."
      );
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    refreshQuestionBank();
  }, []);

  const handleManualQuestionTypeChange = (nextType: QuestionType) => {
    setManualForm((prev) => ({
      ...prev,
      question: {
        ...createEmptyQuestion(nextType),
        id: prev.question.id,
        difficulty: prev.question.difficulty,
      },
    }));
  };

  const handleManualOptionChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setManualForm((prev) => ({
      ...prev,
      question: {
        ...prev.question,
        options: prev.question.options.map((option, optionIndex) =>
          optionIndex === index ? value : option
        ),
      },
    }));
  };

  const addManualOption = () => {
    setManualForm((prev) => ({
      ...prev,
      question: {
        ...prev.question,
        options: [...prev.question.options, ""],
      },
    }));
  };

  const removeManualOption = (index: number) => {
    setManualForm((prev) => ({
      ...prev,
      question: {
        ...prev.question,
        options: prev.question.options.filter(
          (_, optionIndex) => optionIndex !== index
        ),
        correctAnswer:
          prev.question.correctAnswer === prev.question.options[index]
            ? ""
            : prev.question.correctAnswer,
      },
    }));
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!manualForm.lessonId) {
      toast.error("Please select a lesson");
      return;
    }

    if (!manualForm.question.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (
      manualForm.question.type === "MCQ" &&
      (!manualForm.question.correctAnswer ||
        !manualForm.question.correctAnswer.trim())
    ) {
      toast.error("Select the correct answer for the MCQ");
      return;
    }

    setSavingManual(true);

    try {
      const payload = {
        lessonId: manualForm.lessonId,
        createdById: session?.user?.id,
        difficulty: manualForm.question.difficulty,
        questions: [
          {
            type: manualForm.question.type,
            questionText: manualForm.question.questionText.trim(),
            options:
              manualForm.question.type === "MCQ"
                ? manualForm.question.options.map((option) => option.trim())
                : undefined,
            correctAnswer:
              manualForm.question.type === "MCQ"
                ? manualForm.question.correctAnswer.trim()
                : undefined,
            explanation: manualForm.question.explanation.trim() || undefined,
            sampleAnswer:
              manualForm.question.type === "ESSAY"
                ? manualForm.question.sampleAnswer.trim()
                : undefined,
            difficulty: manualForm.question.difficulty,
          },
        ],
      };

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to save question");
      }

      toast.success("Question saved to the bank");
      setManualForm((prev) => ({
        ...prev,
        question: createEmptyQuestion(manualForm.question.type),
      }));
      refreshQuestionBank();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save question"
      );
    } finally {
      setSavingManual(false);
    }
  };

  const handleAiGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!aiForm.lessonId) {
      toast.error("Please select a lesson");
      return;
    }

    if (!aiForm.studyMaterialId) {
      toast.error("Select a lesson related PDF from study materials");
      return;
    }

    if (aiForm.mcqCount === 0 && aiForm.essayCount === 0) {
      toast.error("Select at least one question type to generate");
      return;
    }

    if (aiForm.mcqCount > 10 || aiForm.essayCount > 10) {
      toast.error(
        "Maximum 10 questions of each type can be generated at a time"
      );
      return;
    }

    if (aiForm.customPrompt.length > 50) {
      toast.error("Custom prompt must be 50 characters or less");
      return;
    }

    setIsGenerating(true);

    try {
      const selectedLesson = lessons.find((l) => l.id === aiForm.lessonId);
      const selectedMaterial = studyMaterials.find(
        (m) => m.id === aiForm.studyMaterialId
      );
      const formData = new FormData();
      formData.append("lessonId", aiForm.lessonId);
      formData.append("lessonTitle", selectedLesson?.title ?? "");
      formData.append("createdById", session?.user?.id ?? "");
      formData.append("difficulty", aiForm.difficulty);
      formData.append("mcqCount", aiForm.mcqCount.toString());
      formData.append("essayCount", aiForm.essayCount.toString());
      formData.append("materialId", aiForm.studyMaterialId);
      formData.append("customPrompt", aiForm.customPrompt);

      const response = await fetch("/api/questions/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate questions");
      }

      const generated = (data.questions ?? []) as Array<{
        type: QuestionType;
        questionText: string;
        options?: string[];
        correctAnswer?: string;
        explanation?: string;
        sampleAnswer?: string;
        difficulty?: Difficulty;
      }>;

      setGeneratedQuestions(
        generated.map((question) => ({
          id: crypto.randomUUID(),
          type: question.type,
          questionText: question.questionText,
          options: question.options ?? [],
          correctAnswer: question.correctAnswer ?? "",
          explanation: question.explanation ?? "",
          sampleAnswer: question.sampleAnswer ?? "",
          difficulty: question.difficulty ?? data.difficulty ?? "MEDIUM",
          sourceFileUrl: data.sourceFileName,
        }))
      );
      setAiMetadata({
        lessonId: data.lessonId ?? aiForm.lessonId,
        lessonTitle: data.lessonTitle ?? "Selected Lesson",
        difficulty: data.difficulty ?? aiForm.difficulty,
        sourceFileName: data.sourceFileName,
      });
      toast.success("Questions generated. Review and save them to the bank.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratedQuestionChange = (
    id: string,
    field: keyof GeneratedQuestion,
    value: string,
    optionIndex?: number
  ) => {
    setGeneratedQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question;

        if (field === "options" && typeof optionIndex === "number") {
          const nextOptions = question.options.map((option, index) =>
            index === optionIndex ? value : option
          );
          return { ...question, options: nextOptions };
        }

        return {
          ...question,
          [field]: value,
        } as GeneratedQuestion;
      })
    );
  };

  const saveGeneratedQuestions = async () => {
    if (!generatedQuestions.length || !aiMetadata) {
      toast.error("Generate questions before saving");
      return;
    }

    try {
      const payload = {
        lessonId: aiMetadata.lessonId,
        createdById: session?.user?.id,
        difficulty: aiMetadata.difficulty,
        questions: generatedQuestions.map((question) => ({
          type: question.type,
          questionText: question.questionText.trim(),
          options:
            question.type === "MCQ"
              ? question.options.map((option) => option.trim())
              : undefined,
          correctAnswer:
            question.type === "MCQ" ? question.correctAnswer.trim() : undefined,
          explanation: question.explanation.trim() || undefined,
          sampleAnswer:
            question.type === "ESSAY"
              ? question.sampleAnswer.trim()
              : undefined,
          difficulty: question.difficulty,
          sourceFileUrl: question.sourceFileUrl,
        })),
      };

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to save generated questions");
      }

      toast.success("Generated questions saved to the bank");
      setGeneratedQuestions([]);
      setAiMetadata(null);
      refreshQuestionBank();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save generated questions"
      );
    }
  };

  const startEditingQuestion = (question: StoredQuestion) => {
    setEditingQuestion(question);
    setEditForm({
      lessonId: question.lessonId,
      question: {
        id: question.id,
        type: question.type,
        questionText: question.questionText,
        options: normalizeOptions(question.options),
        correctAnswer: question.correctAnswer ?? "",
        explanation: question.explanation ?? "",
        sampleAnswer: question.sampleAnswer ?? "",
        difficulty: (question.difficulty as Difficulty) ?? "MEDIUM",
      },
    });
  };

  const handleUpdateQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editForm || !editingQuestion) return;

    if (!editForm.lessonId) {
      toast.error("Please select a lesson");
      return;
    }

    if (!editForm.question.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        lessonId: editForm.lessonId,
        type: editForm.question.type,
        questionText: editForm.question.questionText.trim(),
        options:
          editForm.question.type === "MCQ"
            ? editForm.question.options.map((opt) => opt.trim())
            : undefined,
        correctAnswer:
          editForm.question.type === "MCQ"
            ? editForm.question.correctAnswer.trim()
            : undefined,
        explanation: editForm.question.explanation.trim() || undefined,
        sampleAnswer:
          editForm.question.type === "ESSAY"
            ? editForm.question.sampleAnswer.trim()
            : undefined,
        difficulty: editForm.question.difficulty,
      };

      const response = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to update question");
      }

      toast.success("Question updated successfully");
      setEditingQuestion(null);
      setEditForm(null);
      refreshQuestionBank();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update question"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestionId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/questions/${deletingQuestionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete question");
      }

      toast.success("Question deleted successfully");
      setDeletingQuestionId(null);
      refreshQuestionBank();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete question"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {initialView === "creation" && (
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-2xl font-bold">
                Question Creation
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Manual &amp; AI Creation</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual">
                <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                  <TabsTrigger value="manual">Manual Creation</TabsTrigger>
                  <TabsTrigger value="ai">AI Assisted</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-6">
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-1">
                      <div className="space-y-2">
                        <Label htmlFor="manual-lesson">Lesson title</Label>
                        <Select
                          value={manualForm.lessonId}
                          onValueChange={(value) =>
                            setManualForm((prev) => ({
                              ...prev,
                              lessonId: value,
                            }))
                          }
                        >
                          <SelectTrigger id="manual-lesson">
                            <SelectValue placeholder="Select a lesson" />
                          </SelectTrigger>
                          <SelectContent>
                            {lessons.map((lesson) => (
                              <SelectItem key={lesson.id} value={lesson.id}>
                                {lesson.title}
                              </SelectItem>
                            ))}
                            {lessons.length === 0 && !lessonsLoading && (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No lessons found.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="question-type">Question type</Label>
                        <Select
                          value={manualForm.question.type}
                          onValueChange={(value: QuestionType) =>
                            handleManualQuestionTypeChange(value)
                          }
                        >
                          <SelectTrigger id="question-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCQ">Multiple choice</SelectItem>
                            <SelectItem value="ESSAY">Essay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="question-difficulty">
                          Question difficulty
                        </Label>
                        <Select
                          value={manualForm.question.difficulty}
                          onValueChange={(value: Difficulty) =>
                            setManualForm((prev) => ({
                              ...prev,
                              question: { ...prev.question, difficulty: value },
                            }))
                          }
                        >
                          <SelectTrigger id="question-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {difficultyOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="question-text">Question</Label>
                      <Textarea
                        id="question-text"
                        placeholder="Enter the question prompt"
                        value={manualForm.question.questionText}
                        onChange={(event) =>
                          setManualForm((prev) => ({
                            ...prev,
                            question: {
                              ...prev.question,
                              questionText: event.target.value,
                            },
                          }))
                        }
                        rows={4}
                      />
                    </div>

                    {manualForm.question.type === "MCQ" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addManualOption}
                          >
                            Add option
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {manualForm.question.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(event) =>
                                  handleManualOptionChange(index, event)
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeManualOption(index)}
                                disabled={
                                  manualForm.question.options.length <= 2
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <Label>Select correct answer</Label>
                          <Select
                            value={manualForm.question.correctAnswer}
                            onValueChange={(value) =>
                              setManualForm((prev) => ({
                                ...prev,
                                question: {
                                  ...prev.question,
                                  correctAnswer: value,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose the correct option" />
                            </SelectTrigger>
                            <SelectContent>
                              {manualForm.question.options
                                .filter((option) => option.trim().length > 0)
                                .map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="manual-explanation">
                            Explanation (shown after submission)
                          </Label>
                          <Textarea
                            id="manual-explanation"
                            placeholder="Provide a short explanation for the correct answer"
                            value={manualForm.question.explanation}
                            onChange={(event) =>
                              setManualForm((prev) => ({
                                ...prev,
                                question: {
                                  ...prev.question,
                                  explanation: event.target.value,
                                },
                              }))
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    {manualForm.question.type === "ESSAY" && (
                      <div className="space-y-2">
                        <Label htmlFor="manual-sample-answer">
                          Sample answer (visible only to teachers)
                        </Label>
                        <Textarea
                          id="manual-sample-answer"
                          placeholder="Provide a model answer to guide manual grading"
                          value={manualForm.question.sampleAnswer}
                          onChange={(event) =>
                            setManualForm((prev) => ({
                              ...prev,
                              question: {
                                ...prev.question,
                                sampleAnswer: event.target.value,
                              },
                            }))
                          }
                          rows={4}
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={savingManual}
                    >
                      {savingManual ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save question
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="ai" className="mt-6">
                  <form onSubmit={handleAiGenerate} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ai-lesson">Lesson title</Label>
                        <Select
                          value={aiForm.lessonId}
                          onValueChange={(value) =>
                            setAiForm((prev) => ({
                              ...prev,
                              lessonId: value,
                              studyMaterialId: "", // Reset selection on lesson change
                            }))
                          }
                        >
                          <SelectTrigger id="ai-lesson">
                            <SelectValue placeholder="Select a lesson" />
                          </SelectTrigger>
                          <SelectContent>
                            {lessons.map((lesson) => (
                              <SelectItem key={lesson.id} value={lesson.id}>
                                {lesson.title}
                              </SelectItem>
                            ))}
                            {lessons.length === 0 && !lessonsLoading && (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No lessons found.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ai-difficulty">Target difficulty</Label>
                        <Select
                          value={aiForm.difficulty}
                          onValueChange={(value: Difficulty) =>
                            setAiForm((prev) => ({
                              ...prev,
                              difficulty: value,
                            }))
                          }
                        >
                          <SelectTrigger id="ai-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {difficultyOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="ai-mcq">Number of MCQs (Max 10)</Label>
                        <Input
                          id="ai-mcq"
                          type="number"
                          min={0}
                          max={10}
                          value={aiForm.mcqCount}
                          onChange={(event) =>
                            setAiForm((prev) => ({
                              ...prev,
                              mcqCount: Math.min(
                                10,
                                Number.parseInt(event.target.value || "0", 10)
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ai-essay">
                          Number of essay questions (Max 10)
                        </Label>
                        <Input
                          id="ai-essay"
                          type="number"
                          min={0}
                          max={10}
                          value={aiForm.essayCount}
                          onChange={(event) =>
                            setAiForm((prev) => ({
                              ...prev,
                              essayCount: Math.min(
                                10,
                                Number.parseInt(event.target.value || "0", 10)
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ai-material">
                          Select Study Material
                        </Label>
                        <Select
                          value={aiForm.studyMaterialId}
                          onValueChange={(value) =>
                            setAiForm((prev) => ({
                              ...prev,
                              studyMaterialId: value,
                            }))
                          }
                          disabled={!aiForm.lessonId || materialsLoading}
                        >
                          <SelectTrigger id="ai-material">
                            <SelectValue
                              placeholder={
                                materialsLoading
                                  ? "Loading..."
                                  : materialsError
                                    ? "Error loading"
                                    : aiForm.lessonId
                                      ? "Select a PDF"
                                      : "Select lesson first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {studyMaterials
                              .filter((m) => {
                                const urlPart = m.fileUrl
                                  .toLowerCase()
                                  .split("?")[0];
                                const namePart = (
                                  m.fileName || ""
                                ).toLowerCase();
                                return (
                                  urlPart.endsWith(".pdf") ||
                                  namePart.endsWith(".pdf") ||
                                  m.title.toLowerCase().includes(".pdf")
                                );
                              })
                              .map((material) => (
                                <SelectItem
                                  key={material.id}
                                  value={material.id}
                                >
                                  {material.title}
                                </SelectItem>
                              ))}
                            {studyMaterials.filter((m) => {
                              const urlPart = m.fileUrl
                                .toLowerCase()
                                .split("?")[0];
                              const namePart = (m.fileName || "").toLowerCase();
                              return (
                                urlPart.endsWith(".pdf") ||
                                namePart.endsWith(".pdf") ||
                                m.title.toLowerCase().includes(".pdf")
                              );
                            }).length === 0 &&
                              !materialsLoading &&
                              aiForm.lessonId && (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No PDF materials found for this lesson.
                                </div>
                              )}
                            {!aiForm.lessonId && (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Please select a lesson first.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="ai-prompt">
                          Custom instructions / prompt (Optional)
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {aiForm.customPrompt.length}/50
                        </span>
                      </div>
                      <Input
                        id="ai-prompt"
                        placeholder="e.g. Focus on the introduction, skip historical details..."
                        value={aiForm.customPrompt}
                        onChange={(event) =>
                          setAiForm((prev) => ({
                            ...prev,
                            customPrompt: event.target.value.slice(0, 50),
                          }))
                        }
                        maxLength={50}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      Generate questions
                    </Button>
                  </form>

                  {generatedQuestions.length > 0 && (
                    <div className="mt-8 space-y-4 rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Generated questions
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Review and edit the AI generated content before
                            saving it to the question bank.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setGeneratedQuestions([])}
                          >
                            Clear
                          </Button>
                          <Button
                            className="flex items-center gap-2"
                            onClick={saveGeneratedQuestions}
                          >
                            <Upload className="h-4 w-4" /> Save to bank
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {generatedQuestions.map((question, questionIndex) => (
                          <div
                            key={question.id}
                            className="space-y-4 rounded-md border p-4"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="outline">
                                {question.type === "MCQ"
                                  ? "Multiple choice"
                                  : "Essay"}
                              </Badge>
                              <Badge variant="secondary">
                                Difficulty: {question.difficulty}
                              </Badge>
                              {question.sourceFileUrl && (
                                <Badge variant="outline">
                                  Source: {question.sourceFileUrl}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>Question {questionIndex + 1}</Label>
                              <Textarea
                                value={question.questionText}
                                onChange={(event) =>
                                  handleGeneratedQuestionChange(
                                    question.id,
                                    "questionText",
                                    event.target.value
                                  )
                                }
                                rows={3}
                              />
                            </div>
                            {question.type === "MCQ" && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Options</Label>
                                  <div className="space-y-2">
                                    {question.options.map((option, index) => (
                                      <Input
                                        key={`${question.id}-option-${index}`}
                                        value={option}
                                        onChange={(event) =>
                                          handleGeneratedQuestionChange(
                                            question.id,
                                            "options",
                                            event.target.value,
                                            index
                                          )
                                        }
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Correct answer</Label>
                                  <Input
                                    value={question.correctAnswer}
                                    onChange={(event) =>
                                      handleGeneratedQuestionChange(
                                        question.id,
                                        "correctAnswer",
                                        event.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Explanation</Label>
                                  <Textarea
                                    value={question.explanation}
                                    onChange={(event) =>
                                      handleGeneratedQuestionChange(
                                        question.id,
                                        "explanation",
                                        event.target.value
                                      )
                                    }
                                    rows={3}
                                  />
                                </div>
                              </div>
                            )}
                            {question.type === "ESSAY" && (
                              <div className="space-y-2">
                                <Label>Sample answer</Label>
                                <Textarea
                                  value={question.sampleAnswer}
                                  onChange={(event) =>
                                    handleGeneratedQuestionChange(
                                      question.id,
                                      "sampleAnswer",
                                      event.target.value
                                    )
                                  }
                                  rows={4}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {initialView === "bank" && (
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Question bank
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Filter by lesson title and manage your saved questions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={lessonFilter} onValueChange={setLessonFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All lessons</SelectItem>
                    {uniqueLessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshQuestionBank}
                  disabled={questionLoading}
                >
                  {questionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paginatedQuestions.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No questions found. Create a new question manually or generate
                  with AI.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {paginatedQuestions.map((question) => {
                      const options = normalizeOptions(question.options);
                      const isExpanded = expandedQuestionIds.has(question.id);
                      return (
                        <div
                          key={question.id}
                          className="overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-all hover:bg-card/60"
                        >
                          <div
                            className="flex cursor-pointer items-center justify-between p-4"
                            onClick={() => toggleQuestionExpansion(question.id)}
                          >
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-background/50"
                                >
                                  {question.lesson?.title ?? "General"}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/5 text-primary"
                                >
                                  {question.type}
                                </Badge>
                                {question.difficulty && (
                                  <Badge
                                    variant="outline"
                                    className="capitalize bg-background/50"
                                  >
                                    {question.difficulty.toLowerCase()}
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-foreground">
                                {question.questionText}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Added on{" "}
                                {new Date(question.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingQuestion(question);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingQuestionId(question.id);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isExpanded && "rotate-90"
                                  )}
                                />
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-border/50 bg-muted/20 p-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="space-y-4">
                                {question.type === "MCQ" &&
                                  options.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Options
                                      </p>
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        {options.map((option, index) => {
                                          const isCorrect =
                                            question.correctAnswer === option;
                                          return (
                                            <div
                                              key={`${question.id}-option-${index}`}
                                              className={cn(
                                                "flex items-center gap-2 rounded-lg border border-border/50 p-3 text-sm",
                                                isCorrect
                                                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700"
                                                  : "bg-background/50"
                                              )}
                                            >
                                              <div
                                                className={cn(
                                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                                                  isCorrect
                                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                                    : "border-muted-foreground/30"
                                                )}
                                              >
                                                {String.fromCharCode(
                                                  65 + index
                                                )}
                                              </div>
                                              {option}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                {(question.explanation ||
                                  (question.type === "ESSAY" &&
                                    question.sampleAnswer)) && (
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    {question.explanation && (
                                      <div className="space-y-1.5">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                          Explanation
                                        </p>
                                        <div className="rounded-lg bg-background/50 p-3 text-sm text-muted-foreground">
                                          {question.explanation}
                                        </div>
                                      </div>
                                    )}
                                    {question.type === "ESSAY" &&
                                      question.sampleAnswer && (
                                        <div className="space-y-1.5">
                                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Sample Answer
                                          </p>
                                          <div className="rounded-lg bg-background/50 p-3 text-sm text-muted-foreground">
                                            {question.sampleAnswer}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border/40 pt-4">
                      <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-foreground">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredQuestions.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {filteredQuestions.length}
                        </span>{" "}
                        results
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="h-8 px-2"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => {
                              // Show first, last, current, and neighbors
                              return (
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - currentPage) <= 1
                              );
                            })
                            .map((p, i, arr) => {
                              return (
                                <div
                                  key={p}
                                  className="flex items-center gap-1"
                                >
                                  {i > 0 && arr[i - 1] !== p - 1 && (
                                    <span className="px-1 text-muted-foreground">
                                      ...
                                    </span>
                                  )}
                                  <Button
                                    variant={
                                      currentPage === p ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setCurrentPage(p)}
                                    className={cn(
                                      "h-8 w-8 p-0",
                                      currentPage === p &&
                                        "bg-primary text-primary-foreground"
                                    )}
                                  >
                                    {p}
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="h-8 px-2"
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
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question details in the bank.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Lesson</Label>
                  <Select
                    value={editForm?.lessonId}
                    onValueChange={(val) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, lessonId: val } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={editForm?.question.difficulty}
                    onValueChange={(val: Difficulty) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              question: { ...prev.question, difficulty: val },
                            }
                          : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={editForm?.question.questionText}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            question: {
                              ...prev.question,
                              questionText: e.target.value,
                            },
                          }
                        : null
                    )
                  }
                  rows={3}
                />
              </div>

              {editForm?.question.type === "MCQ" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {editForm?.question.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [
                              ...(editForm?.question.options || []),
                            ];
                            newOpts[idx] = e.target.value;
                            setEditForm((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    question: {
                                      ...prev.question,
                                      options: newOpts,
                                    },
                                  }
                                : null
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={editForm?.question.correctAnswer}
                      onValueChange={(val) =>
                        setEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                question: {
                                  ...prev.question,
                                  correctAnswer: val,
                                },
                              }
                            : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {(editForm?.question.options || [])
                          .filter((o) => o.trim())
                          .map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Explanation</Label>
                    <Textarea
                      value={editForm?.question.explanation}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                question: {
                                  ...prev.question,
                                  explanation: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {editForm?.question.type === "ESSAY" && (
                <div className="space-y-2">
                  <Label>Sample Answer</Label>
                  <Textarea
                    value={editForm?.question.sampleAnswer}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              question: {
                                ...prev.question,
                                sampleAnswer: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    rows={4}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingQuestionId}
        onOpenChange={(open) => !open && setDeletingQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This question will be permanently
              deleted from the question bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteQuestion();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
