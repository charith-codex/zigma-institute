"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  Loader2,
  Search,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  FileText,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import {
  getEnrolledStudentsForCourse,
  getPhysicalExamSummaries,
  getPhysicalExamMarks,
  savePhysicalExamMarks,
  deletePhysicalExam,
  PhysicalExamSummary,
  EnrolledStudent,
} from "@/lib/actions/physical-exam";
import {
  physicalExamSchema,
  type PhysicalExamInput,
} from "@/lib/validators/physical-exam";
import { cn } from "@/lib/utils";
import { FlowerLoader } from "../ui/flower-loader";

export function PhysicalExamUploader({ courseId }: { courseId: string }) {
  const [view, setView] = useState<"list" | "form">("list");
  const [summaries, setSummaries] = useState<PhysicalExamSummary[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingExam, setEditingExam] = useState<PhysicalExamSummary | null>(
    null
  );
  const [examToDelete, setExamToDelete] = useState<PhysicalExamSummary | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<PhysicalExamInput>({
    resolver: zodResolver(physicalExamSchema),
    defaultValues: {
      courseId,
      examTitle: "",
      examDate: new Date().toISOString().split("T")[0],
      paperUrl: "",
      scores: [],
      originalExamTitle: "",
      originalExamDate: "",
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;
  const watchExamTitle = watch("examTitle");
  const watchPaperUrl = watch("paperUrl");

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(lowerQuery) ||
        s.studentPublicId.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const summariesData = await getPhysicalExamSummaries(courseId);
      setSummaries(summariesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load physical exams.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const ensureStudentsLoaded = async () => {
    if (students.length > 0) return students;
    setLoading(true);
    try {
      const studentsData = await getEnrolledStudentsForCourse(courseId);
      setStudents(studentsData);
      return studentsData;
    } catch (error) {
      console.error(error);
      toast.error("Failed to load enrolled students.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateNew = async () => {
    setEditingExam(null);
    const sList = await ensureStudentsLoaded();
    reset({
      courseId,
      examTitle: "",
      examDate: new Date().toISOString().split("T")[0],
      paperUrl: "",
      scores: (sList || []).map((s) => ({
        studentRegistrationId: s.registrationId,
        score: 0,
      })),
      originalExamTitle: "",
      originalExamDate: "",
    });
    setSearchQuery("");
    setView("form");
  };

  const handleEdit = async (summary: PhysicalExamSummary) => {
    setLoading(true);
    try {
      const [examMarks, sList] = await Promise.all([
        getPhysicalExamMarks(courseId, summary.examTitle, summary.examDate),
        ensureStudentsLoaded(),
      ]);

      const examDateStr = new Date(summary.examDate)
        .toISOString()
        .split("T")[0];

      setEditingExam(summary);
      reset({
        courseId,
        examTitle: summary.examTitle,
        examDate: examDateStr,
        paperUrl: summary.paperUrl,
        scores: sList.map((s) => {
          const mark = examMarks.find(
            (m) => m.studentRegistrationId === s.registrationId
          );
          return {
            studentRegistrationId: s.registrationId,
            score: mark ? mark.score : 0,
          };
        }),
        originalExamTitle: summary.examTitle,
        originalExamDate: summary.examDate,
      });
      setSearchQuery("");
      setView("form");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exam marks for editing.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (summary: PhysicalExamSummary) => {
    setExamToDelete(summary);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;

    startTransition(async () => {
      const result = await deletePhysicalExam(
        courseId,
        examToDelete.examTitle,
        examToDelete.examDate
      );
      if (result.success) {
        toast.success("Exam deleted successfully.");
        setIsDeleteDialogOpen(false);
        setExamToDelete(null);
        loadData();
      } else {
        toast.error(result.message || "Failed to delete exam.");
      }
    });
  };

  const onSubmit = async (data: PhysicalExamInput) => {
    startTransition(async () => {
      const result = await savePhysicalExamMarks(data);
      if (result.success) {
        toast.success(
          editingExam
            ? "Exam updated successfully."
            : "Exam created successfully."
        );
        setView("list");
        loadData();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (loading && view === "list") {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
        <FlowerLoader size="md" className="text-[#A41FC5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Physical Exams</h2>
          <p className="text-muted-foreground">
            Manage physical exam papers and student marks for this course.
          </p>
        </div>
        {view === "list" ? (
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Exam
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setView("list")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        )}
      </div>

      {view === "list" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.length === 0 ? (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <CardTitle className="text-lg">No Exams Found</CardTitle>
                <CardDescription>
                  Start by adding your first physical exam paper.
                </CardDescription>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreateNew}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            summaries.map((summary) => (
              <Card
                key={`${summary.examTitle}-${summary.examDate}`}
                className="overflow-hidden border-border/60 hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="outline"
                      className="bg-sky-500/10 text-sky-600 border-sky-500/20 mb-2"
                    >
                      {new Date(summary.examDate).toLocaleDateString([], {
                        dateStyle: "medium",
                      })}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(summary)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(summary)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">
                    {summary.examTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Users className="h-3 w-3" />
                    {summary.studentCount} Students Graded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={summary.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Paper PDF
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>
              {editingExam ? "Edit Physical Exam" : "New Physical Exam"}
            </CardTitle>
            <CardDescription>
              Fill in the details below and upload the exam paper to record
              student marks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <Field>
                    <FieldLabel htmlFor="examTitle">Exam Title</FieldLabel>
                    <FieldContent>
                      <Input
                        id="examTitle"
                        placeholder="e.g., Mid-term Physical Assessment"
                        {...form.register("examTitle")}
                      />
                    </FieldContent>
                    <FieldError errors={[errors.examTitle]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="examDate">Exam Date</FieldLabel>
                    <FieldContent>
                      <Input
                        id="examDate"
                        type="date"
                        {...form.register("examDate")}
                      />
                    </FieldContent>
                    <FieldError errors={[errors.examDate]} />
                  </Field>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <p className="text-xs text-muted-foreground leading-snug">
                      {watchPaperUrl
                        ? "Physical paper has been successfully uploaded and is ready for grading."
                        : "Enter exam title, date and upload the physical exam paper (PDF)"}
                    </p>
                  </div>
                </div>

                <Field>
                  <FieldLabel>Upload Exam Paper</FieldLabel>
                  <FieldContent>
                    {watchExamTitle.trim() ? (
                      <UploadDropzone
                        endpoint="physicalExamPaper"
                        input={{
                          courseId,
                          examTitle: watchExamTitle.trim(),
                          examDate: form.getValues("examDate"),
                        }}
                        onClientUploadComplete={(res) => {
                          const result = res?.[0];
                          if (result?.url) {
                            setValue("paperUrl", result.url);
                            toast.success("Exam paper uploaded.");
                          }
                        }}
                        onUploadError={(error) => {
                          toast.error(error.message);
                        }}
                        appearance={{
                          container: cn(
                            "border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/30 py-8 transition-colors hover:border-primary/50 hover:bg-muted/50",
                            watchPaperUrl && "border-primary/50 bg-primary/5"
                          ),
                          label: "text-sm text-muted-foreground",
                          uploadIcon: "text-primary h-8 w-8",
                          button:
                            "bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 mt-4",
                        }}
                        content={{
                          label() {
                            if (watchPaperUrl)
                              return "Paper uploaded. Click to replace.";
                            return "Drag & drop or click to upload paper";
                          },
                          allowedContent: "PDF (max 64MB)",
                        }}
                      />
                    ) : (
                      <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted/50 bg-muted/10 p-8 text-center transition-all duration-300">
                        <UploadCloud className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Upload Locked
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          Please enter an exam title first
                        </p>
                      </div>
                    )}
                    <FieldError errors={[errors.paperUrl]} />
                  </FieldContent>
                </Field>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Student Marks</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter scores for all eligible students.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-48 sm:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="pl-9 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {filteredStudents.length} / {students.length} Students
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                      No enrolled students found for this course.
                    </p>
                  ) : filteredStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">
                      No students match your search &quot;{searchQuery}&quot;.
                    </p>
                  ) : (
                    students.map((student, index) => {
                      const isVisible = filteredStudents.some(
                        (fs) => fs.registrationId === student.registrationId
                      );

                      if (!isVisible) return null;

                      return (
                        <div
                          key={student.registrationId}
                          className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/60 p-3 px-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Badge
                              variant="secondary"
                              className="font-mono text-[10px] shrink-0"
                            >
                              {student.studentPublicId}
                            </Badge>
                            <span className="font-medium truncate">
                              {student.studentName}
                            </span>
                          </div>
                          <div className="w-32 shrink-0">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              placeholder="Score"
                              className="h-9"
                              {...form.register(`scores.${index}.score`, {
                                valueAsNumber: true,
                              })}
                            />
                            <input
                              type="hidden"
                              {...form.register(
                                `scores.${index}.studentRegistrationId`
                              )}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <FieldError errors={[errors.scores]} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("list")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !watchPaperUrl}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingExam ? "Update Exam Marks" : "Save Exam Marks"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Physical Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{examToDelete?.examTitle}
              &quot;? This will remove all student marks recorded for this exam.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
