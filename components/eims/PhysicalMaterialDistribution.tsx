"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import { useClasses } from "@/hooks/useData";
import { useCourseStudents } from "@/hooks/useCourseStudents";
import { useCourseTuteLedger } from "@/hooks/useCourseTuteLedger";
import { useCourseTutes, useTuteDistributions } from "@/hooks/useTutes";

const placeholderMessage = "Select a course to load students";

export function PhysicalMaterialDistribution() {
  const { classes, loading: coursesLoading } = useClasses();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTute, setSelectedTute] = useState<string>("");
  const [newTuteName, setNewTuteName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    tutes,
    loading: tutesLoading,
    error: tutesError,
    createTute,
    refetch: refreshTutes,
  } = useCourseTutes(selectedCourse || null);

  const {
    students,
    loading: studentsLoading,
    error: studentsError,
  } = useCourseStudents(selectedCourse || null);

  const {
    ledger,
    loading: ledgerLoading,
    error: ledgerError,
    updateEntry: updateLedgerEntry,
  } = useCourseTuteLedger(selectedCourse || null);

  const {
    distributions,
    distributedStudentIds,
    loading: distributionsLoading,
    error: distributionsError,
    updatingStudentId,
    updateDistribution,
  } = useTuteDistributions(selectedTute || null);

  useEffect(() => {
    setSelectedTute("");
    setSearchTerm("");
  }, [selectedCourse]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return students;
    }

    const normalized = searchTerm.trim().toLowerCase();

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalized) ||
        student.id.toLowerCase().includes(normalized) ||
        (student.studentPublicId?.toLowerCase().includes(normalized) ?? false)
    );
  }, [searchTerm, students]);

  const activeTuteName = useMemo(
    () => tutes.find((tute) => tute.id === selectedTute)?.name ?? "Tute",
    [selectedTute, tutes]
  );

  const totalDistributed = distributedStudentIds.size;

  const handleCreateTute = async () => {
    if (!selectedCourse) {
      toast.error("Select a course before creating a tute.");
      return;
    }

    const trimmedName = newTuteName.trim();

    if (!trimmedName) {
      toast.error("Enter a tute name to create it.");
      return;
    }

    try {
      const created = await createTute(trimmedName);
      setSelectedTute(created.id);
      setNewTuteName("");
      toast.success(`${trimmedName} created for the course.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create tute.";
      toast.error(message);
    }
  };

  const handleDistributionChange = async (studentId: string, distributed: boolean) => {
    if (!selectedCourse) {
      toast.error("Select a course before marking distribution.");
      return;
    }

    if (!selectedTute) {
      toast.error("Select a tute before marking distribution.");
      return;
    }

    try {
      await updateDistribution(studentId, distributed);
      updateLedgerEntry(studentId, { id: selectedTute, name: activeTuteName }, distributed);
      void refreshTutes();
      toast.success(
        distributed
          ? `${activeTuteName} marked as distributed.`
          : `${activeTuteName} marked as pending.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update distribution right now.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Physical Material Distribution</h1>
          <p className="text-muted-foreground text-sm">
            Select a course, choose a tute, search students, and mark who received it.
          </p>
        </div>
        {selectedCourse && selectedTute ? (
          <Badge variant="secondary" className="text-sm">
            {totalDistributed} marked as distributed
          </Badge>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribute a Tute</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(courseId) => setSelectedCourse(courseId)}
                disabled={coursesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Choose a course"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Create Tute</Label>
              <div className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_auto] md:items-end">
                <Input
                  value={newTuteName}
                  onChange={(event) => setNewTuteName(event.target.value)}
                  placeholder="e.g. Algebra Tute"
                  spellCheck={false}
                  disabled={!selectedCourse || tutesLoading}
                />
                <Button
                  className="w-full md:w-auto"
                  onClick={handleCreateTute}
                  disabled={!selectedCourse || tutesLoading}
                >
                  Create tute
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Tute</Label>
            <Select
              value={selectedTute}
              onValueChange={(tuteId) => setSelectedTute(tuteId)}
              disabled={!selectedCourse || tutesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedCourse
                      ? tutesLoading
                        ? "Loading tutes..."
                        : "Choose a tute"
                      : "Select a course first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tutes.map((tute) => (
                  <SelectItem key={tute.id} value={tute.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{tute.name}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {tute.distributedCount} given
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tutesError ? <p className="text-xs text-destructive">{tutesError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Search Students</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, student ID, or public ID"
                className="pl-8"
                spellCheck={false}
                disabled={!selectedCourse || studentsLoading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {selectedCourse ? classes.find((c) => c.id === selectedCourse)?.name ?? "" : placeholderMessage}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedCourse
                    ? studentsLoading
                      ? "Loading enrolled students..."
                      : `${students.length} enrolled students`
                    : "Course selection is required"}
                </p>
              </div>
              {selectedTute ? (
                <Badge variant="outline" className="text-xs">
                  Tute: {activeTuteName}
                </Badge>
              ) : null}
            </div>

            {studentsError ? (
              <p className="text-xs text-destructive">{studentsError}</p>
            ) : null}
            {ledgerError ? <p className="text-xs text-destructive">{ledgerError}</p> : null}
            {distributionsError ? (
              <p className="text-xs text-destructive">{distributionsError}</p>
            ) : null}

            <div className="space-y-2 rounded-md border p-4">
              {selectedCourse ? (
                studentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading students...</p>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const isDistributed = distributions[student.id]?.distributed ?? false;
                    const isDisabled = !selectedTute || distributionsLoading || updatingStudentId === student.id;
                    const receivedTutes = ledger[student.id]?.tutes ?? [];

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.studentPublicId ? `${student.id} · ${student.studentPublicId}` : student.id}
                          </p>
                          {receivedTutes.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {receivedTutes.map((tute) => (
                                <Badge key={tute.id} variant="outline" className="text-[10px] font-normal">
                                  {tute.name}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {ledgerLoading ? "Syncing..." : "Distributed"}
                          </span>
                          <Switch
                            checked={isDistributed}
                            onCheckedChange={(checked) => void handleDistributionChange(student.id, checked)}
                            disabled={isDisabled}
                            aria-label={`Mark ${activeTuteName} as distributed to ${student.name}`}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No students match your search.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">{placeholderMessage}.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
