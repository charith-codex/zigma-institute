"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  ArrowLeft,
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
import type { ClassSummary } from "@/hooks/useData";
import { useLessons } from "@/hooks/useData";
import { StudyMaterialManager } from "./StudyMaterialManager";
import { VideoRecordingManager } from "./VideoRecordingManager";
import { PhysicalExamUploader } from "./PhysicalExamUploader";
import { LessonForm } from "./LessonForm";
import { deleteLesson } from "@/lib/actions/lesson";
import { EnrolledStudents } from "./EnrolledStudents";

interface CourseContentManagerProps {
  courseId: string;
  loading?: boolean;
  classes?: ClassSummary[];
}

const navigationItems = [
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
  { id: "quizzes", label: "Question Bank", icon: ClipboardList },
  { id: "exams", label: "Exam Papers", icon: FileText },
  { id: "exam-sessions", label: "Exam Sessions", icon: Target },
  { id: "exam-results", label: "Exam Results", icon: BarChart3 },
  { id: "physical-exams", label: "Physical Exam Marks", icon: HeartPulse },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function CourseContentManager({
  courseId,
  loading = false,
  classes = [],
}: CourseContentManagerProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("lessons");
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false);
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
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

  console.log("CourseContentManager - courseId:", courseId);
  console.log("CourseContentManager - classes:", classes);

  const classItem = useMemo(
    () => classes.find((cls) => cls.id === courseId),
    [classes, courseId]
  );
  console.log("CourseContentManager - classItem:", classItem);

  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    refetch,
  } = useLessons(classItem?.id);

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
                  Create lessons to organize materials, exams, and student
                  activities for this course. Select a lesson to upload study
                  materials and videos for it.
                </p>
              </div>
              <Dialog
                open={lessonDialogOpen}
                onOpenChange={setLessonDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:shadow-medium">
                    <Plus className="w-4 h-4 mr-2" />
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

            {lessonsError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {lessonsError}
              </div>
            )}

            {lessonsLoading ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
                <div className="flex justify-center">
                  <FlowerLoader size="md" className="text-[#A41FC5]" />
                </div>
              </div>
            ) : lessons.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h4 className="text-lg font-semibold">No lessons yet</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start building your course by creating the first lesson.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                <Card className="h-full">
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {sortedLessons.map((lesson) => {
                        const createdDate = new Date(lesson.createdAt);
                        const formattedDate = isNaN(createdDate.getTime())
                          ? "Recently created"
                          : createdDate.toLocaleString();

                        const isSelected = selectedLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`flex w-full flex-col items-start gap-2 px-4 py-3 text-left transition-colors ${
                              isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={isSelected ? "default" : "outline"}
                                >
                                  Lesson
                                </Badge>
                                <span className="text-sm font-semibold">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formattedDate}
                              </span>
                            </div>
                            {lesson.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {lesson.description}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {selectedLesson ? (
                    <Card className="border-border/60 bg-card">
                      <CardContent className="space-y-3 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold">
                              {selectedLesson.title}
                            </h4>
                            {selectedLesson.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {selectedLesson.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              ID: {selectedLesson.id.slice(0, 8).toUpperCase()}
                            </Badge>
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
                              <Pencil className="h-4 w-4 mr-1.5" />
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
                              <Trash2 className="h-4 w-4 mr-1.5" />
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
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        Select a lesson to manage study materials and videos.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "students":
        return classItem ? (
          <EnrolledStudents courseId={courseId} courseName={classItem.name} />
        ) : null;

      case "quizzes":
        return <QuestionCreation />;

      case "exams":
        return <ExamBuilder courseId={courseId} />;

      case "exam-sessions":
        return <ExamScheduler courseId={courseId} />;

      case "exam-results":
        return <ExamResults courseId={courseId} />;

      case "physical-exams":
        return <PhysicalExamUploader courseId={courseId} />;

      case "analytics":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Analytics</h3>
            </div>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold mb-2">Course Analytics</h4>
              <p className="text-muted-foreground">
                View detailed analytics and insights about your class
                performance.
              </p>
            </div>
          </div>
        );

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

  // Handle class not found case
  if (!classItem) {
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
            Available courses: {classes.map((c) => c.id).join(", ")}
          </p>
        </div>
        <Button onClick={() => router.push("/lms-cms")}>Back to Courses</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-linear-to-br from-background via-background to-muted/20">
        {/* Left Sidebar */}
        <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border/50 p-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/lms-cms")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h2 className="text-lg font-bold">{classItem.name}</h2>
              <p className="text-sm text-muted-foreground">
                {classItem.code || classItem.slug || classItem.id}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-gradient-primary text-white shadow-medium"
                    : "hover:bg-primary/5 hover:shadow-soft"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon
                  className={`w-4 h-4 mr-3 ${
                    activeSection === item.id ? "text-white" : "text-primary"
                  }`}
                />
                <span
                  className={`font-medium ${
                    activeSection === item.id ? "text-white" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="p-8">{renderContent()}</div>
        </div>
      </div>

      {/* Edit Lesson Dialog */}
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

      {/* Delete Lesson Confirmation Dialog */}
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
                <div className="text-center">
                  <FlowerLoader size="lg" className="text-[#A41FC5] mx-auto" />
                </div>
              )}
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
