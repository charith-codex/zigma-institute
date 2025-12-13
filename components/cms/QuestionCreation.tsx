"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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
import { RefreshCw, Save, Upload, Wand2 } from "lucide-react";
import { FlowerLoader } from "../ui/flower-loader";

const difficultyOptions = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

type Difficulty = (typeof difficultyOptions)[number]["value"];
type QuestionType = "MCQ" | "ESSAY";

type StoredQuestion = {
  id: string;
  lessonTitle: string;
  type: QuestionType;
  questionText: string;
  options?: { id?: number; text?: string }[] | string[] | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  sampleAnswer?: string | null;
  difficulty?: Difficulty | null;
  sourceFileUrl?: string | null;
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
  lessonTitle: string;
  question: DraftQuestion;
};

type AiFormState = {
  lessonTitle: string;
  difficulty: Difficulty;
  mcqCount: number;
  essayCount: number;
  file: File | null;
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

export function QuestionCreation() {
  const [manualForm, setManualForm] = useState<ManualFormState>(() => ({
    lessonTitle: "",
    question: createEmptyQuestion("MCQ"),
  }));
  const [manualDifficulty, setManualDifficulty] =
    useState<Difficulty>("MEDIUM");
  const [savingManual, setSavingManual] = useState(false);

  const [aiForm, setAiForm] = useState<AiFormState>({
    lessonTitle: "",
    difficulty: "MEDIUM",
    mcqCount: 3,
    essayCount: 1,
    file: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [aiMetadata, setAiMetadata] = useState<{
    lessonTitle: string;
    difficulty: Difficulty;
    sourceFileName?: string;
  } | null>(null);

  const [questionBank, setQuestionBank] = useState<StoredQuestion[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [lessonFilter, setLessonFilter] = useState("all");

  const filteredQuestions = useMemo(() => {
    if (lessonFilter === "all" || !lessonFilter.trim()) {
      return questionBank;
    }

    return questionBank.filter((question) =>
      question.lessonTitle.toLowerCase().includes(lessonFilter.toLowerCase())
    );
  }, [lessonFilter, questionBank]);

  const uniqueLessons = useMemo(() => {
    const lessons = new Set(
      questionBank.map((question) => question.lessonTitle)
    );
    return Array.from(lessons).sort((a, b) => a.localeCompare(b));
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

    if (!manualForm.lessonTitle.trim()) {
      toast.error("Lesson title is required");
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
        lessonTitle: manualForm.lessonTitle.trim(),
        difficulty: manualDifficulty,
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
      setManualForm({
        lessonTitle: manualForm.lessonTitle,
        question: createEmptyQuestion(manualForm.question.type),
      });
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

    if (!aiForm.lessonTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    if (!aiForm.file) {
      toast.error("Upload a lesson PDF to generate questions");
      return;
    }

    if (aiForm.mcqCount === 0 && aiForm.essayCount === 0) {
      toast.error("Select at least one question type to generate");
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("lessonTitle", aiForm.lessonTitle.trim());
      formData.append("difficulty", aiForm.difficulty);
      formData.append("mcqCount", aiForm.mcqCount.toString());
      formData.append("essayCount", aiForm.essayCount.toString());
      formData.append("lessonPdf", aiForm.file);

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
        lessonTitle: data.lessonTitle ?? aiForm.lessonTitle,
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
        lessonTitle: aiMetadata.lessonTitle,
        difficulty: aiMetadata.difficulty,
        sourceFileUrl: aiMetadata.sourceFileName,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-bold">
            Question Creation
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Manual &amp; AI Creation</Badge>
            <Badge variant="secondary">Question Bank</Badge>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manual-lesson">Lesson title</Label>
                    <Input
                      id="manual-lesson"
                      placeholder="e.g. Introduction to React"
                      value={manualForm.lessonTitle}
                      onChange={(event) =>
                        setManualForm((prev) => ({
                          ...prev,
                          lessonTitle: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-difficulty">Difficulty</Label>
                    <Select
                      value={manualDifficulty}
                      onValueChange={(value: Difficulty) =>
                        setManualDifficulty(value)
                      }
                    >
                      <SelectTrigger id="manual-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                          <SelectItem key={option.value} value={option.value}>
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
                            disabled={manualForm.question.options.length <= 2}
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
                    <div className="text-center">
                      <FlowerLoader
                        size="md"
                        className="text-[#A41FC5] mx-auto"
                      />
                    </div>
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
                    <Input
                      id="ai-lesson"
                      placeholder="e.g. Advanced Algorithms"
                      value={aiForm.lessonTitle}
                      onChange={(event) =>
                        setAiForm((prev) => ({
                          ...prev,
                          lessonTitle: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-difficulty">Target difficulty</Label>
                    <Select
                      value={aiForm.difficulty}
                      onValueChange={(value: Difficulty) =>
                        setAiForm((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger id="ai-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ai-mcq">Number of MCQs</Label>
                    <Input
                      id="ai-mcq"
                      type="number"
                      min={0}
                      value={aiForm.mcqCount}
                      onChange={(event) =>
                        setAiForm((prev) => ({
                          ...prev,
                          mcqCount: Number.parseInt(
                            event.target.value || "0",
                            10
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-essay">Number of essay questions</Label>
                    <Input
                      id="ai-essay"
                      type="number"
                      min={0}
                      value={aiForm.essayCount}
                      onChange={(event) =>
                        setAiForm((prev) => ({
                          ...prev,
                          essayCount: Number.parseInt(
                            event.target.value || "0",
                            10
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-file">Upload lesson PDF</Label>
                    <Input
                      id="ai-file"
                      type="file"
                      accept="application/pdf"
                      onChange={(event) =>
                        setAiForm((prev) => ({
                          ...prev,
                          file: event.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="text-center">
                      <FlowerLoader
                        size="md"
                        className="text-[#A41FC5] mx-auto"
                      />
                    </div>
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
                        Review and edit the AI generated content before saving
                        it to the question bank.
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
                  <SelectItem key={lesson} value={lesson}>
                    {lesson}
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
                <div className="text-center">
                  <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
                </div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No questions found. Create a new question manually or generate
              with AI.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => {
                const options = normalizeOptions(question.options);
                return (
                  <div
                    key={question.id}
                    className="space-y-3 rounded-md border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{question.lessonTitle}</Badge>
                      <Badge variant="secondary">{question.type}</Badge>
                      {question.difficulty && (
                        <Badge variant="outline">
                          Difficulty: {question.difficulty}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{question.questionText}</p>
                      <p className="text-xs text-muted-foreground">
                        Added on {new Date(question.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {question.type === "MCQ" && options.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Options</p>
                        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                          {options.map((option, index) => (
                            <li key={`${question.id}-option-${index}`}>
                              {option}
                            </li>
                          ))}
                        </ul>
                        {question.correctAnswer && (
                          <p className="text-sm text-emerald-600">
                            Correct answer: {question.correctAnswer}
                          </p>
                        )}
                      </div>
                    )}
                    {question.type === "ESSAY" && question.sampleAnswer && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground">
                          View sample answer
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                          {question.sampleAnswer}
                        </p>
                      </details>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground">
                        Explanation: {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
