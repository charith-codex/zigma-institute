"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import CourseCard from "@/components/courses/course-card";
import { CourseCreateForm } from "@/components/eims/CourseCreateForm";
import { useCourses } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  DollarSign,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Course } from "@/types";

export function CourseManagement() {
  const { courses, loading, error, refetch } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseBeingEdited, setCourseBeingEdited] = useState<Course | null>(
    null
  );
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedQuery = searchTerm.trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) => {
      const valuesToMatch = [course.name, course.slug, course.teacherName];
      return valuesToMatch.some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [courses, normalizedQuery]);

  const uniqueTeachers = useMemo(() => {
    const teacherSet = new Set(
      courses.map((course) => course.teacherName.toLowerCase())
    );
    return teacherSet.size;
  }, [courses]);

  const catalogValueInCents = useMemo(
    () => courses.reduce((sum, course) => sum + course.priceInCents, 0),
    [courses]
  );

  const catalogCurrency = courses[0]?.currency ?? "USD";

  const isInitialLoading = loading && courses.length === 0;
  const hasCourses = filteredCourses.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Course Management</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Staff manage the courses from the EIMS dashboard. Lesson planning
            and delivery are handled by teachers inside the CMS once a course is
            published.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="mr-2 h-4 w-4" />
              Create course
            </Button>
          </DialogTrigger>
          <DialogContent
            size="wide"
            className="w-full max-w-none h-full md:h-auto overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Create a new course</DialogTitle>
            </DialogHeader>
            <CourseCreateForm
              onSuccess={() => {
                setIsDialogOpen(false);
                void refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or teacher"
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="w-fit">
          {filteredCourses.length} of {courses.length} courses
        </Badge>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {hasCourses
                ? "Updated automatically from the course catalog"
                : "No courses available yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assign Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Teachers continue lesson creation in the CMS
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All courses monthly value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(catalogValueInCents, catalogCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sum of published courses monthly prices
            </p>
          </CardContent>
        </Card>
      </div>

      {isInitialLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading courses...
          </CardContent>
        </Card>
      ) : hasCourses ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead className="w-24 text-center">Edit</TableHead>
                    <TableHead className="w-28 text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                            <Image
                              src={course.coverImage}
                              alt={course.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium leading-none">
                              {course.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.description.slice(0, 60)}
                              {course.description.length > 60 ? "…" : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {course.teacherName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(course.priceInCents, course.currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCourseBeingEdited(course)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCourseToDelete(course)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No courses matched your search. Create a course to get started.
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(courseBeingEdited)}
        onOpenChange={(open) => {
          if (!open) {
            setCourseBeingEdited(null);
          }
        }}
      >
        <DialogContent
          size="wide"
          className="w-full max-w-none h-full md:h-auto overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Edit course</DialogTitle>
          </DialogHeader>
          {courseBeingEdited ? (
            <CourseCreateForm
              course={courseBeingEdited}
              onSuccess={() => {
                setCourseBeingEdited(null);
                void refetch();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(courseToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setCourseToDelete(null);
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete course</DialogTitle>
            <DialogDescription>
              {courseToDelete
                ? `Are you sure you want to delete "${courseToDelete.name}"? This action cannot be undone.`
                : "Are you sure you want to delete this course?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseToDelete(null)}
              disabled={isDeleting}
            >
              No, keep course
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!courseToDelete) {
                  return;
                }
                try {
                  setIsDeleting(true);
                  const response = await fetch(
                    `/api/courses/${courseToDelete.id}`,
                    {
                      method: "DELETE",
                    }
                  );

                  if (!response.ok) {
                    const body = await response
                      .json()
                      .catch(() => ({ error: "Failed to delete course." }));
                    throw new Error(body.error ?? "Failed to delete course.");
                  }

                  toast.success("Course deleted successfully.");
                  setCourseToDelete(null);
                  await refetch();
                } catch (deleteError) {
                  console.error(deleteError);
                  toast.error(
                    deleteError instanceof Error
                      ? deleteError.message
                      : "Failed to delete course."
                  );
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, delete course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
