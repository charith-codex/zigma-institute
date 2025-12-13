"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  CalendarDays,
  CheckCircle,
  QrCode,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses } from "@/hooks/useData";
import { FlowerLoader } from "../ui/flower-loader";

interface AttendanceSessionSummary {
  id: string;
  courseId: string | null;
  courseName: string;
  sessionDate: string;
  totalMarked: number;
}

interface AttendanceEntry {
  id: string;
  studentPublicId: string;
  studentName: string;
  markedAt: string;
}

interface StudentQrPayload {
  type: "ZIGMA_STUDENT_ID";
  studentPublicId: string;
  studentName: string;
  studentEmail?: string;
  registrationId?: string;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });

const todayInputValue = new Date().toISOString().split("T")[0]!;

const formatDate = (value: string) => DATE_FORMATTER.format(new Date(value));
const formatDateTime = (value: string) => {
  const date = new Date(value);
  return `${DATE_FORMATTER.format(date)} • ${TIME_FORMATTER.format(date)}`;
};

function parseQrPayload(rawValue: string): StudentQrPayload | null {
  try {
    const parsed = JSON.parse(rawValue);
    if (parsed?.type !== "ZIGMA_STUDENT_ID") {
      return null;
    }
    if (
      typeof parsed.studentPublicId !== "string" ||
      parsed.studentPublicId.length === 0
    ) {
      return null;
    }
    if (
      typeof parsed.studentName !== "string" ||
      parsed.studentName.length === 0
    ) {
      return null;
    }
    return {
      type: "ZIGMA_STUDENT_ID",
      studentPublicId: parsed.studentPublicId,
      studentName: parsed.studentName,
      studentEmail:
        typeof parsed.studentEmail === "string"
          ? parsed.studentEmail
          : undefined,
      registrationId:
        typeof parsed.registrationId === "string" &&
        parsed.registrationId.length > 0
          ? parsed.registrationId
          : undefined,
    };
  } catch {
    return null;
  }
}

const AttendanceQR = () => {
  const { courses, loading: coursesLoading } = useCourses();
  const [sessions, setSessions] = useState<AttendanceSessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [courseId, setCourseId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>(todayInputValue);
  const [creatingSession, setCreatingSession] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  );

  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0]!.id);
    }
  }, [courseId, courses]);

  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch("/api/attendance/qr/sessions");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to load sessions");
      }
      const payload: AttendanceSessionSummary[] = await response.json();
      setSessions(payload);
      setSessionsError(null);
      setSelectedSessionId((previous) => previous ?? payload[0]?.id ?? null);
    } catch (error) {
      console.error("Failed to load attendance sessions", error);
      setSessions([]);
      setSessionsError(
        error instanceof Error
          ? error.message
          : "Unable to load attendance sessions"
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const fetchEntries = useCallback(async (sessionId: string) => {
    try {
      setEntriesLoading(true);
      const response = await fetch(`/api/attendance/qr/sessions/${sessionId}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to load attendance log");
      }
      const payload = await response.json();
      setEntries(payload.entries ?? []);
    } catch (error) {
      console.error("Failed to load attendance entries", error);
      setEntries([]);
      toast.error(
        error instanceof Error ? error.message : "Unable to load attendance log"
      );
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setEntries([]);
      setScanning(false);
      return;
    }
    void fetchEntries(selectedSessionId);
  }, [fetchEntries, selectedSessionId]);

  const handleCreateSession = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!courseId || !sessionDate) {
      toast.error("Select a course and date");
      return;
    }

    const course = courses.find((item) => item.id === courseId);
    if (!course) {
      toast.error("Unable to find the selected course");
      return;
    }

    try {
      setCreatingSession(true);
      const response = await fetch("/api/attendance/qr/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          courseName: course.name,
          sessionDate,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to create session");
      }

      const payload: AttendanceSessionSummary = await response.json();
      toast.success("Attendance session added");
      setSessionDate(todayInputValue);
      setSessions((prev) => [payload, ...prev]);
      setSelectedSessionId(payload.id);
    } catch (error) {
      console.error("Failed to create attendance session", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to create session"
      );
    } finally {
      setCreatingSession(false);
    }
  };

  const markAttendance = useCallback(
    async (payload: StudentQrPayload) => {
      if (!selectedSessionId) {
        setScanError("Select or create a session before scanning");
        setScanning(false);
        return;
      }

      try {
        setMarking(true);
        const response = await fetch("/api/attendance/qr/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: selectedSessionId,
            studentPublicId: payload.studentPublicId,
            studentName: payload.studentName,
            registrationId: payload.registrationId ?? null,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Unable to mark attendance");
        }

        const body = await response.json();
        const entry: AttendanceEntry = body.entry;
        setEntries((prev) => {
          const exists = prev.some((item) => item.id === entry.id);
          if (exists) {
            return prev.map((item) => (item.id === entry.id ? entry : item));
          }
          return [entry, ...prev];
        });
        setSessions((prev) =>
          prev.map((session) =>
            session.id === selectedSessionId && !body.alreadyMarked
              ? { ...session, totalMarked: session.totalMarked + 1 }
              : session
          )
        );
        setScannedStudent(entry.studentPublicId);
        setScanError(null);
        toast.success(
          body.alreadyMarked
            ? "Attendance already recorded for this student"
            : "Attendance marked"
        );
      } catch (error) {
        console.error("Failed to mark attendance", error);
        setScanError(
          error instanceof Error ? error.message : "Unable to mark attendance"
        );
        toast.error(
          error instanceof Error ? error.message : "Unable to mark attendance"
        );
      } finally {
        setMarking(false);
        setScanning(false);
      }
    },
    [selectedSessionId]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = (result: any) => {
    if (!result) return;
    const rawValue =
      typeof result === "string"
        ? result
        : Array.isArray(result) && result[0]?.rawValue
          ? result[0].rawValue
          : "";
    if (!rawValue) return;

    const payload = parseQrPayload(rawValue);
    if (!payload) {
      setScanError("Unrecognized QR code");
      setScanning(false);
      return;
    }
    void markAttendance(payload);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (err: any) => {
    setScanError(err?.message || "Camera access or scan error");
    setScanning(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" /> QR Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-muted-foreground/40 p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active session
                </p>
                {activeSession ? (
                  <p className="text-lg font-semibold text-foreground">
                    {activeSession.courseName} •{" "}
                    {formatDate(activeSession.sessionDate)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Create or select a session to begin scanning.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{activeSession?.totalMarked ?? 0} marked</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (!activeSession) {
                    setScanError("Create a session before scanning");
                    return;
                  }
                  setScanError(null);
                  setScannedStudent(null);
                  setScanning(true);
                }}
                disabled={!activeSession || scanning}
              >
                <QrCode className="mr-2 h-4 w-4" />
                {scanning ? "Scanning..." : "Start scanning"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setScanning(false)}
                disabled={!scanning}
              >
                Stop
              </Button>
              <Button
                variant="outline"
                onClick={() => activeSession && fetchEntries(activeSession.id)}
                disabled={!activeSession || entriesLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh log
              </Button>
            </div>

            {scanning ? (
              <div className="relative w-full overflow-hidden rounded-xl border bg-black">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  allowMultiple={false}
                  components={{ finder: true }}
                  constraints={{ facingMode: "environment" }}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
                Activate the scanner to capture student ID cards. QR codes now
                include attendance metadata, so each scan updates the selected
                session instantly.
              </div>
            )}

            {marking && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="text-center">
                  <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
                </div>
              </div>
            )}
            {scannedStudent && !marking && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="h-4 w-4" /> Attendance recorded for{" "}
                {scannedStudent}
              </div>
            )}
            {scanError && (
              <p className="text-sm text-destructive">{scanError}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entriesLoading ? (
              <div className="text-center">
                <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
              </div>
            ) : null}
            {entries.length === 0 && !entriesLoading ? (
              <p className="text-sm text-muted-foreground">
                No attendance entries yet. Start scanning to populate the log.
              </p>
            ) : null}
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {entry.studentName}
                    </p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {entry.studentPublicId}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatDateTime(entry.markedAt)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Plan sessions by course
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleCreateSession}>
              <div className="space-y-1">
                <p className="text-sm font-medium">Course</p>
                <Select
                  value={courseId}
                  onValueChange={setCourseId}
                  disabled={coursesLoading || courses.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {courses.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add a course first to start tracking attendance.
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Session date</p>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(event) => setSessionDate(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={creatingSession || !courseId || !sessionDate}
              >
                {creatingSession ? (
                  <div className="text-center">
                    <FlowerLoader
                      size="md"
                      className="text-[#A41FC5] mx-auto"
                    />
                    Saving...
                  </div>
                ) : (
                  <>
                    <CalendarDays className="mr-2 h-4 w-4" /> Schedule session
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">
                  Upcoming sessions
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchSessions()}
                  disabled={sessionsLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>

              {sessionsError && (
                <p className="text-sm text-destructive">{sessionsError}</p>
              )}

              {sessionsLoading ? (
                <div className="text-center">
                  <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
                  Loading sessions...
                </div>
              ) : null}

              {sessions.length === 0 && !sessionsLoading ? (
                <p className="text-sm text-muted-foreground">
                  No sessions yet. Create one to start tracking attendance by
                  date.
                </p>
              ) : null}

              <div className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedSessionId === session.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {session.courseName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.sessionDate)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {session.totalMarked} present
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceQR;
