import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Calendar } from "lucide-react";
import type { LessonSummary } from "@/hooks/useData";

interface LessonNavigationProps {
  lessons: LessonSummary[];
  selectedLessonId?: string | null;
  onSelectLesson: (lessonId: string) => void;
  isLoading?: boolean;
}

export function LessonNavigation({
  lessons,
  selectedLessonId,
  onSelectLesson,
  isLoading,
}: LessonNavigationProps) {
  const sortedLessons = [...lessons].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-muted/60"
          />
        ))}
      </div>
    );
  }

  if (sortedLessons.length === 0) {
    return (
      <div className="p-4 text-center">
        <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No lessons available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {sortedLessons.map((lesson, index) => (
          <Button
            key={lesson.id}
            variant={selectedLessonId === lesson.id ? "default" : "ghost"}
            className={`h-auto w-full justify-start p-3 ${
              selectedLessonId === lesson.id
                ? "bg-gradient-primary text-white shadow-medium"
                : "hover:bg-primary/5"
            }`}
            onClick={() => onSelectLesson(lesson.id)}
          >
            <div className="flex w-full flex-col items-start">
              <div className="mb-1 flex w-full items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    selectedLessonId === lesson.id ? "text-white" : ""
                  }`}
                >
                  Lesson {index + 1}
                </span>
                <Badge
                  variant={selectedLessonId === lesson.id ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <span
                className={`w-full truncate text-left text-xs ${
                  selectedLessonId === lesson.id
                    ? "text-white/80"
                    : "text-muted-foreground"
                }`}
              >
                {lesson.title}
              </span>
              {lesson.updatedAt && (
                <div
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    selectedLessonId === lesson.id
                      ? "text-white/70"
                      : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>
                    Updated {new Date(lesson.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}

export default LessonNavigation;
