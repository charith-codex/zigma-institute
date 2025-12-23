"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  FileText,
  Plus,
  BookOpen,
  Users,
  BarChart3,
  ClipboardList,
  Target,
  HeartPulse,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { QuestionCreation } from "./QuestionCreation";
import { ExamBuilder } from "./ExamBuilder";
import { ExamScheduler } from "./ExamScheduler";
import { ExamResults } from "./ExamResults";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CourseSummary } from "@/hooks/useData";
import { useLessons } from "@/hooks/useData";
import { StudyMaterialManager } from "./StudyMaterialManager";
import { VideoRecordingManager } from "./VideoRecordingManager";
import { PhysicalExamUploader } from "./PhysicalExamUploader";
import { LessonForm } from "./LessonForm";
import { deleteLesson } from "@/lib/actions/lesson";
import { EnrolledStudents } from "./EnrolledStudents";
import { LessonNavigation } from "../lms/LessonNavigation";
import { CourseAnalytics } from "./CourseAnalytics";

export const courseNavigationItems = [
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
  {
    id: "questions",
    label: "Questions",
    icon: ClipboardList,
    subItems: [
      { id: "question-creation", label: "Question Creation" },
      { id: "question-bank", label: "Question Bank" },
    ],
  },
  { id: "exams", label: "Exam Papers", icon: FileText },
  { id: "exam-sessions", label: "Exam Sessions", icon: Target },
  { id: "exam-results", label: "Exam Results", icon: BarChart3 },
  { id: "physical-exams", label: "Physical Exam Marks", icon: HeartPulse },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export type CourseSectionId =
  | (typeof courseNavigationItems)[number]["id"]
  | "question-creation"
  | "question-bank";

interface CourseContentManagerProps {
  courseId: string;
  loading?: boolean;
  courses?: CourseSummary[];
  activeSection: CourseSectionId;
  onSectionChange: (sectionId: CourseSectionId) => void;
}

export function CourseContentManager({
  courseId,
  loading = false,
  courses = [],
  activeSection,
  onSectionChange,
}: CourseContentManagerProps) {
  const router = useRouter();
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false);
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonSheetOpen, setLessonSheetOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<{
    id: string;
    title: string;
    description: string | null;
  } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  const courseItem = useMemo(
    () => courses.find((cls) => cls.id === courseId),
    [courses, courseId]
  );

  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    refetch,
  } = useLessons(courseItem?.id);

  const sortedLessons = useMemo(
    () =>
      [...lessons].sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
      ),
    [lessons]
  );

  useEffect(() => {
    if (sortedLessons.length === 0) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId((previous) => {
      if (previous && sortedLessons.some((lesson) => lesson.id === previous)) {
        return previous;
      }

      return sortedLessons[0]?.id ?? null;
    });
  }, [sortedLessons]);

  const selectedLesson = useMemo(
    () =>
      sortedLessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [selectedLessonId, sortedLessons]
  );

  const currentLessonPosition = useMemo(() => {
    if (!selectedLesson) return null;

    const lessonIndex = sortedLessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id
    );

    return lessonIndex >= 0 ? lessonIndex + 1 : null;
  }, [selectedLesson, sortedLessons]);

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setLessonSheetOpen(false);
  };

  const handleEditLesson = (lesson: {
    id: string;
    title: string;
    description: string | null;
  }) => {
    setLessonToEdit(lesson);
    setEditLessonDialogOpen(true);
  };

  const handleDeleteLesson = (lesson: { id: string; title: string }) => {
    setLessonToDelete(lesson);
    setDeleteLessonDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lessonToDelete) return;

    try {
      setDeletingLesson(true);
      await deleteLesson(lessonToDelete.id);
      toast.success("Lesson deleted successfully!");
      setDeleteLessonDialogOpen(false);
      setLessonToDelete(null);

      // Clear selected lesson if it was deleted
      if (selectedLessonId === lessonToDelete.id) {
        setSelectedLessonId(null);
      }

      await refetch();
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete lesson"
      );
    } finally {
      setDeletingLesson(false);
    }
  };

  const handleLessonSuccess = async () => {
    setLessonDialogOpen(false);
    setEditLessonDialogOpen(false);
    setLessonToEdit(null);
    await refetch();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "lessons":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold">Course Lessons</h3>
                <p className="text-sm text-muted-foreground">
                  Create lessons to organize materials for this course. Select a
                  lesson to upload study materials and videos for it.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Sheet open={lessonSheetOpen} onOpenChange={setLessonSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="sm:hidden">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Open Lessons
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full max-w-full p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border bg-muted/40 px-4 py-3">
                      <SheetTitle className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Lesson list
                      </SheetTitle>
                    </SheetHeader>
                    <div className="h-full overflow-hidden">
                      <LessonNavigation
                        lessons={sortedLessons}
                        selectedLessonId={selectedLessonId}
                        onSelectLesson={handleSelectLesson}
                        isLoading={lessonsLoading}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <Dialog
                  open={lessonDialogOpen}
                  onOpenChange={setLessonDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary hover:shadow-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      Create lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a new lesson</DialogTitle>
                      <DialogDescription>
                        Provide a title and optional description to add a lesson
                        to this course.
                      </DialogDescription>
                    </DialogHeader>
                    <LessonForm
                      courseId={courseId}
                      onSuccess={handleLessonSuccess}
                      onCancel={() => setLessonDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {lessonsError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {lessonsError}
              </div>
            )}

            {lessonsLoading ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
                <FlowerLoader size="md" className="text-[#A41FC5]" />
              </div>
            ) : sortedLessons.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h4 className="text-lg font-semibold">No lessons yet</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start building your course by creating the first lesson.
                </p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-col gap-4 lg:flex-row">
                <aside className="hidden w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 lg:flex">
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold px-2">Lessons</p>
                      </div>
                      <Badge variant="secondary">{sortedLessons.length}</Badge>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <LessonNavigation
                      lessons={sortedLessons}
                      selectedLessonId={selectedLessonId}
                      onSelectLesson={handleSelectLesson}
                      isLoading={lessonsLoading}
                    />
                  </div>
                </aside>

                <Card className="flex-1 border-border/70 bg-card/70">
                  <CardContent className="space-y-5 p-4 sm:p-6">
                    {selectedLesson ? (
                      <>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                Lesson {currentLessonPosition ?? "-"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Updated{" "}
                                {new Date(
                                  selectedLesson.updatedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-xl font-semibold leading-tight">
                              {selectedLesson.title}
                            </h4>
                            {selectedLesson.description && (
                              <p className="text-sm text-muted-foreground">
                                {selectedLesson.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="sm:hidden"
                              onClick={() => setLessonSheetOpen(true)}
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Lesson list
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditLesson({
                                  id: selectedLesson.id,
                                  title: selectedLesson.title,
                                  description: selectedLesson.description,
                                })
                              }
                            >
                              <Pencil className="mr-1.5 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteLesson({
                                  id: selectedLesson.id,
                                  title: selectedLesson.title,
                                })
                              }
                            >
                              <Trash2 className="mr-1.5 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <StudyMaterialManager
                            lessonId={selectedLesson.id}
                            lessonTitle={selectedLesson.title}
                          />
                          <VideoRecordingManager
                            lessonId={selectedLesson.id}
                            lessonTitle={selectedLesson.title}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        Select a lesson to manage study materials and videos.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case "students":
        return courseItem ? (
          <EnrolledStudents courseId={courseId} courseName={courseItem.name} />
        ) : null;

      case "questions":
      case "question-creation":
        return <QuestionCreation courseId={courseId} initialView="creation" />;

      case "question-bank":
        return <QuestionCreation courseId={courseId} initialView="bank" />;

      case "exams":
        return <ExamBuilder courseId={courseId} />;

      case "exam-sessions":
        return <ExamScheduler courseId={courseId} />;

      case "exam-results":
        return <ExamResults courseId={courseId} />;

      case "physical-exams":
        return <PhysicalExamUploader courseId={courseId} />;

      case "analytics":
        return <CourseAnalytics courseId={courseId} />;

      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <FlowerLoader size="md" className="text-[#A41FC5] mx-auto mb-4" />
          <p className="text-muted-foreground">
            Please wait while we load the class content
          </p>
        </div>
      </div>
    );
  }

  // Handle course not found case
  if (!courseItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Course Not Found
          </h3>
          <p className="text-muted-foreground">
            Looking for course ID: {courseId}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Available courses: {courses.map((c) => c.id).join(", ")}
          </p>
        </div>
        <Button onClick={() => router.push("/lms-cms")}>Back to Courses</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>

      <Dialog
        open={editLessonDialogOpen}
        onOpenChange={setEditLessonDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>
              Update the lesson title and description.
            </DialogDescription>
          </DialogHeader>
          {lessonToEdit && (
            <LessonForm
              courseId={courseId}
              lessonId={lessonToEdit.id}
              initialData={{
                title: lessonToEdit.title,
                description: lessonToEdit.description,
              }}
              onSuccess={handleLessonSuccess}
              onCancel={() => setEditLessonDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteLessonDialogOpen}
        onOpenChange={setDeleteLessonDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{lessonToDelete?.title}
              &quot;? This will also delete all associated study materials,
              videos, and questions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteLessonDialogOpen(false);
                setLessonToDelete(null);
              }}
              disabled={deletingLesson}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingLesson}
            >
              {deletingLesson && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
