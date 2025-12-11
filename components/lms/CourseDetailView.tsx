import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CalendarClock, Play, Video } from "lucide-react";
import { LessonNavigation } from "./LessonNavigation";
import StudyMaterialManager from "../cms/StudyMaterialManager";
import VideoRecordingManager from "../cms/VideoRecordingManager";
import { useLessons } from "@/hooks/useData";

interface CourseDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classData: any;
  onBack: () => void;
}

export const CourseDetailView = ({
  classData,
  onBack,
}: CourseDetailViewProps) => {
  const { lessons, loading: lessonsLoading } = useLessons(classData?.id);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (lessonsLoading) {
      return;
    }

    if (lessons.length === 0) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId((previous) => {
      if (previous && lessons.some((lesson) => lesson.id === previous)) {
        return previous;
      }
      return lessons[0]?.id ?? null;
    });
  }, [lessons, lessonsLoading]);

  const selectedLesson = useMemo(() => {
    return lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;
  }, [lessons, selectedLessonId]);

  return (
    <div className="flex h-full">
      <div className="flex w-80 flex-col border-r border-border">
        <div className="border-b border-border p-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <Play className="mr-2 h-4 w-4 rotate-180" />
            Back to Courses
          </Button>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{classData.name}</h2>
            <p className="text-sm text-muted-foreground">
              {classData.code} • {classData.instructor}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{classData.progress}%</span>
              </div>
              <Progress value={classData.progress} className="h-2" />
            </div>
          </div>
        </div>

        <LessonNavigation
          lessons={lessons}
          selectedLessonId={selectedLessonId}
          onSelectLesson={setSelectedLessonId}
          isLoading={lessonsLoading}
        />
      </div>

      <div className="flex-1 overflow-auto bg-muted/20 p-6">
        {lessonsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : !selectedLesson ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No lessons available</h3>
            <p className="text-muted-foreground">
              Lessons will appear here once they are created for this course.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {selectedLesson.title}
                  </CardTitle>
                  {selectedLesson.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedLesson.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Created{" "}
                      {new Date(selectedLesson.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="outline">Lesson</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>Uploads are scoped to this lesson</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Manage and view recordings for this lesson. Videos stay tied
                  to{" "}
                  <span className="font-medium text-foreground">
                    {selectedLesson.title}
                  </span>
                  .
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Upload study materials like notes, tutorials, and references
                  for this lesson.
                </div>
              </CardContent>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailView;
