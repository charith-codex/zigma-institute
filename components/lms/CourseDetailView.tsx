import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CalendarClock,
  LayoutList,
  Play,
  StepForward,
} from "lucide-react";
import { LessonNavigation } from "./LessonNavigation";
import StudyMaterialManager from "../cms/StudyMaterialManager";
import VideoRecordingManager from "../cms/VideoRecordingManager";
import { useLessons } from "@/hooks/useData";

export interface CourseDetailData {
  id: string;
  name: string;
  slug?: string | null;
  teacherName?: string | null;
  instructor?: string | null;
  code?: string;
  progress?: number;
  status?: string;
}

interface CourseDetailViewProps {
  classData: CourseDetailData;
  onBack: () => void;
}

export const CourseDetailView = ({
  classData,
  onBack,
}: CourseDetailViewProps) => {
  const { lessons, loading: lessonsLoading } = useLessons(classData?.id);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);

  const orderedLessons = useMemo(() => {
    return [...lessons].sort((firstLesson, secondLesson) => {
      return (
        new Date(firstLesson.createdAt).getTime() -
        new Date(secondLesson.createdAt).getTime()
      );
    });
  }, [lessons]);

  const currentLessonIndex = useMemo(() => {
    if (!selectedLessonId) {
      return -1;
    }

    return orderedLessons.findIndex((lesson) => lesson.id === selectedLessonId);
  }, [orderedLessons, selectedLessonId]);

  const currentLessonPosition =
    currentLessonIndex >= 0 ? currentLessonIndex + 1 : null;

  const previousLessonId =
    currentLessonIndex > 0
      ? (orderedLessons[currentLessonIndex - 1]?.id ?? null)
      : null;

  const nextLessonId =
    currentLessonIndex >= 0 && currentLessonIndex < orderedLessons.length - 1
      ? (orderedLessons[currentLessonIndex + 1]?.id ?? null)
      : null;

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsLessonSheetOpen(false);
  };

  useEffect(() => {
    if (lessonsLoading) {
      return;
    }

    if (orderedLessons.length === 0) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId((previous) => {
      if (previous && orderedLessons.some((lesson) => lesson.id === previous)) {
        return previous;
      }
      return orderedLessons[0]?.id ?? null;
    });
  }, [lessonsLoading, orderedLessons]);

  const selectedLesson = useMemo(() => {
    return (
      orderedLessons.find((lesson) => lesson.id === selectedLessonId) ?? null
    );
  }, [orderedLessons, selectedLessonId]);

  const instructorName =
    classData.instructor ?? classData.teacherName ?? "Instructor";
  const totalLessons = orderedLessons.length;
  const lastUpdatedLesson = orderedLessons[orderedLessons.length - 1];
  const lastUpdatedLabel = lastUpdatedLesson
    ? new Date(lastUpdatedLesson.updatedAt).toLocaleDateString()
    : "Not available";

  const handleMoveToPrevious = () => {
    if (previousLessonId) {
      setSelectedLessonId(previousLessonId);
    }
  };

  const handleMoveToNext = () => {
    if (nextLessonId) {
      setSelectedLessonId(nextLessonId);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-col gap-4 border-b border-border bg-background/80 p-4 backdrop-blur supports-backdrop-filter:backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" onClick={onBack} className="w-fit">
            <Play className="mr-2 h-4 w-4 rotate-180" />
            Back to Courses
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold leading-tight">
                {classData.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {instructorName}
              </span>
              <span className="flex items-center gap-2">
                <LayoutList className="h-4 w-4" />
                {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Updated {lastUpdatedLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Sheet open={isLessonSheetOpen} onOpenChange={setIsLessonSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden" size="sm">
                <LayoutList className="mr-2 h-4 w-4" />
                Open Lessons
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-full p-0 sm:max-w-md"
            >
              <SheetHeader className="border-b border-border bg-muted/40">
                <SheetTitle className="flex items-center gap-2">
                  <LayoutList className="h-4 w-4" /> Lesson list
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <LessonNavigation
                  lessons={orderedLessons}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={handleSelectLesson}
                  isLoading={lessonsLoading}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveToPrevious}
              disabled={!previousLessonId}
            >
              <Play className="mr-2 h-4 w-4 rotate-180" />
              Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMoveToNext}
              disabled={!nextLessonId}
            >
              Next lesson
              <StepForward className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-border lg:flex">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Lessons</p>
                <p className="text-xs text-muted-foreground">
                  Choose a lesson to view content
                </p>
              </div>
              <Badge variant="secondary">{totalLessons}</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <LessonNavigation
              lessons={orderedLessons}
              selectedLessonId={selectedLessonId}
              onSelectLesson={handleSelectLesson}
              isLoading={lessonsLoading}
            />
          </div>
        </aside>

        <section className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
          {lessonsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-56 w-full" />
            </div>
          ) : !selectedLesson ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No lessons available
              </h3>
              <p className="text-muted-foreground">
                Lessons will appear here once they are created for this course.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Lesson {currentLessonPosition ?? "-"}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {selectedLesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Updated{" "}
                  {new Date(selectedLesson.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Lesson {currentLessonPosition ?? "-"}
                      </Badge>
                      <CardTitle className="text-xl">
                        {selectedLesson.title}
                      </CardTitle>
                    </div>
                    {selectedLesson.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedLesson.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Updated{" "}
                      {new Date(selectedLesson.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
              </Card>

              <VideoRecordingManager
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                readOnly
              />

              <StudyMaterialManager
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                readOnly
              />

              <div className="flex flex-wrap items-center gap-2 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[140px]"
                  onClick={handleMoveToPrevious}
                  disabled={!previousLessonId}
                >
                  <Play className="mr-2 h-4 w-4 rotate-180" />
                  Previous
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 min-w-[140px]"
                  onClick={handleMoveToNext}
                  disabled={!nextLessonId}
                >
                  Next lesson
                  <StepForward className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CourseDetailView;
