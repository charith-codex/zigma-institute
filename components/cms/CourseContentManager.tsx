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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import type { ClassSummary } from "@/hooks/useData";
import { useLessons } from "@/hooks/useData";
import { StudyMaterialManager } from "./StudyMaterialManager";
import { VideoRecordingManager } from "./VideoRecordingManager";
import { PhysicalExamUploader } from "./PhysicalExamUploader";
import { LessonForm } from "./LessonForm";
import { deleteLesson } from "@/lib/actions/lesson";
import { EnrolledStudents } from "./EnrolledStudents";
import { LessonNavigation } from "../lms/LessonNavigation";
import { cn } from "@/lib/utils";

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

type CourseSectionId = (typeof navigationItems)[number]["id"];

interface CourseSidebarProps {
  courseName: string;
  courseCode: string;
  activeSection: CourseSectionId;
  onSectionChange: (sectionId: CourseSectionId) => void;
  onBack: () => void;
  className?: string;
}

const CourseSidebar = ({
  courseName,
  courseCode,
  activeSection,
  onSectionChange,
  onBack,
  className,
}: CourseSidebarProps) => {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleSelect = (sectionId: CourseSectionId) => {
    onSectionChange(sectionId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" className={cn("bg-card text-foreground", className)}>
      <SidebarContent className="flex h-full flex-col gap-4 p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-xl"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <div className="space-y-1 px-1">
          <h2 className="text-lg font-bold leading-tight">{courseName}</h2>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {courseCode}
          </p>
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Course navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-12 justify-start rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-primary text-white shadow-medium"
                          : "hover:bg-muted"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3"
                        onClick={() => handleSelect(item.id)}
                      >
                        <item.icon
                          className={cn("h-4 w-4", isActive ? "text-white" : "text-primary")}
                        />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export function CourseContentManager({
  courseId,
  loading = false,
  classes = [],
}: CourseContentManagerProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<CourseSectionId>("lessons");
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

  const classItem = useMemo(
    () => classes.find((cls) => cls.id === courseId),
    [classes, courseId]
  );

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
                  Create lessons to organize materials, exams, and student activities for this
                  course. Select a lesson to upload study materials and videos for it.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Sheet open={lessonSheetOpen} onOpenChange={setLessonSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="sm:hidden">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Lessons
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-full p-0 sm:max-w-md">
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
                <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
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
                        Provide a title and optional description to add a lesson to this course.
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
                <aside className="hidden w-80 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 lg:flex">
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">Lessons</p>
                        <p className="text-xs text-muted-foreground">
                          Select a lesson to manage content
                        </p>
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
                              <Badge variant="outline">
                                {selectedLesson.id.slice(0, 8).toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Updated {new Date(selectedLesson.updatedAt).toLocaleDateString()}
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
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-linear-to-br from-background via-background to-muted/20">
        <CourseSidebar
          className="w-72 border-r border-border/60 bg-card/90"
          courseName={classItem.name}
          courseCode={classItem.code || classItem.slug || classItem.id}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onBack={() => router.push("/lms-cms")}
        />

        <SidebarInset className="flex-1 overflow-hidden">
          <div className="flex h-full w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </SidebarInset>
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
    </SidebarProvider>
  );
}
