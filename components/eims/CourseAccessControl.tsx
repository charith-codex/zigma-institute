"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { FlowerLoader } from "@/components/ui/flower-loader";
import { useCourseSummaries, useEnrollments } from "@/hooks/useData";

export function CourseAccessControl() {
  const { courseSummaries, loading: coursesLoading } = useCourseSummaries();
  const {
    enrollments,
    loading: enrollmentsLoading,
    refetch: refreshEnrollments,
  } = useEnrollments();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Synchronize local state with hook data
  const [localEnrollments, setLocalEnrollments] = useState(enrollments);

  useEffect(() => {
    setLocalEnrollments(enrollments);
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    let list = localEnrollments;

    if (selectedCourseId && selectedCourseId !== "all") {
      list = list.filter((e) => e.courseId === selectedCourseId);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.student?.name.toLowerCase().trim().includes(query) ||
          e.student?.studentPublicId?.toLowerCase().trim().includes(query) ||
          e.student?.email.toLowerCase().trim().includes(query)
      );
    }

    return list;
  }, [localEnrollments, selectedCourseId, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, searchTerm]);

  const totalPages = Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE);
  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnrollments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnrollments, currentPage]);

  const handleToggleAccess = async (
    enrollmentId: string,
    isActive: boolean
  ) => {
    // Optimistic update
    const previousEnrollments = [...localEnrollments];
    setLocalEnrollments((current) =>
      current.map((e) => (e.id === enrollmentId ? { ...e, isActive } : e))
    );

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update access status.");
      }

      toast.success(
        `Access ${isActive ? "enabled" : "disabled"} successfully.`
      );
      // We don't necessarily need to await refreshEnrollments() here if we trust our local update,
      // but we can call it in the background to ensure sync.
      void refreshEnrollments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student access.");
      // Revert on error
      setLocalEnrollments(previousEnrollments);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Course Access Control</h1>
          <p className="text-muted-foreground text-sm">
            Search students and enable/disable their access to specific courses.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Student Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Filter by Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={coursesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      coursesLoading ? "Loading courses..." : "All Courses"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseSummaries.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, Public ID, or Email"
                  className="pl-8"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {enrollmentsLoading
                  ? "Loading students..."
                  : `${filteredEnrollments.length} matching enrollments`}
              </p>
            </div>

            <div className="space-y-2 rounded-md border p-4">
              {enrollmentsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <FlowerLoader size="md" className="text-primary" />
                  <p className="text-sm font-medium">
                    Fetching enrollment data...
                  </p>
                </div>
              ) : filteredEnrollments.length > 0 ? (
                paginatedEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-3 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${enrollment.isActive ? "bg-success/10" : "bg-destructive/10"}`}
                      >
                        {enrollment.isActive ? (
                          <ShieldCheck
                            className={`h-5 w-5 ${enrollment.isActive ? "text-success" : "text-destructive"}`}
                          />
                        ) : (
                          <ShieldAlert className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {enrollment.student?.name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.student?.studentPublicId
                            ? `${enrollment.student.studentPublicId} · `
                            : ""}
                          {enrollment.courseName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <Badge
                          variant={
                            enrollment.isActive ? "default" : "secondary"
                          }
                          className={
                            enrollment.isActive
                              ? "bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/30"
                              : ""
                          }
                        >
                          {enrollment.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <Switch
                        checked={enrollment.isActive}
                        onCheckedChange={(checked) =>
                          void handleToggleAccess(enrollment.id, checked)
                        }
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-12 text-muted-foreground">
                  No students found matching your criteria.
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredEnrollments.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredEnrollments.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
