"use client";

import { useMemo, useState } from "react";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredEnrollments = useMemo(() => {
    let list = enrollments;

    if (selectedCourseId && selectedCourseId !== "all") {
      list = list.filter((e) => e.courseId === selectedCourseId);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.student?.name.toLowerCase().includes(query) ||
          e.student?.studentPublicId?.toLowerCase().includes(query) ||
          e.student?.email.toLowerCase().includes(query)
      );
    }

    return list;
  }, [enrollments, selectedCourseId, searchTerm]);

  const handleToggleAccess = async (
    enrollmentId: string,
    isActive: boolean
  ) => {
    setUpdatingId(enrollmentId);
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
      await refreshEnrollments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student access.");
    } finally {
      setUpdatingId(null);
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
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => (
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
                        disabled={updatingId === enrollment.id}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  {enrollmentsLoading
                    ? "Fetching enrollment data..."
                    : "No students found matching your criteria."}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
