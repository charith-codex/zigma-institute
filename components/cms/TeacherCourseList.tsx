import { Button } from "@/components/ui/button";
import type { ClassSummary } from "@/hooks/useData";
import type { Course } from "@/types";
import { BookOpen, Plus } from "lucide-react";
import CourseCard from "@/components/courses/course-card";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { FlowerLoader } from "../ui/flower-loader";

interface TeacherCourseListProps {
  onSelectClass: (courseId: string) => void;
  classes: ClassSummary[];
  loading: boolean;
}

export function TeacherCourseList({
  onSelectClass,
  classes,
  loading,
}: TeacherCourseListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Transform ClassSummary to Course type for CourseCard
  const transformedCourses = useMemo<Course[]>(() => {
    return classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      slug: classItem.slug || classItem.code?.toLowerCase() || classItem.id,
      description: classItem.description || "",
      coverImage: classItem.coverImage || "/images/placeholder-course.jpg",
      teacherId: classItem.teacher_id,
      teacherName: classItem.teacher_name || "No Teacher Assigned",
      courseCategoryId: "",
      priceInCents: 0,
      currency: "LKR",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }, [classes]);

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return transformedCourses;
    }

    return transformedCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery) ||
        course.teacherName?.toLowerCase().includes(normalizedQuery)
    );
  }, [transformedCourses, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="flex justify-center">
            <FlowerLoader size="md" className="text-[#A41FC5]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-sm text-muted-foreground">
            Click on a course to manage your teaching courses.
          </p>
        </div>

        {/* Search Input */}
        {classes.length > 0 && (
          <div className="space-y-2 max-w-sm w-full sm:w-auto">
            <Input
              id="course-search"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10"
            />
          </div>
        )}
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 xl:grid-cols-2">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showPrice={false}
              showDescription
              onClick={(event) => {
                event.preventDefault();
                onSelectClass(course.id);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {searchQuery ? "No courses found" : "No courses available"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try a different search term."
                : "You haven't been assigned any courses yet."}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {classes.length === 0 && !loading && (
        <div className="text-center py-24 animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            <BookOpen className="w-16 h-16 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground mb-8 text-sm max-w-md mx-auto">
            Ready to start your teaching journey? Request your first course
            assignment and begin inspiring minds.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Course Assignment
          </Button>
        </div>
      )}
    </div>
  );
}
