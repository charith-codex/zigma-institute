"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Search, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/lib/uploadthing";
import {
  getEnrolledStudentsForCourse,
  getPhysicalExamMarks,
  PhysicalExamMarkRecord,
  savePhysicalExamMarks,
} from "@/lib/actions/physical-exam";

type EnrolledStudent = {
  registrationId: string;
  studentPublicId: string;
  studentName: string;
};

interface ExamPaperUploadProps {
  courseId: string;
  examTitle: string;
  onExamTitleChange: (value: string) => void;
  paperUrl: string | null;
  onUploadComplete: (payload: { url: string }) => void;
  uploading: boolean;
  onUploadingChange: (value: boolean) => void;
  examDate: string;
  onExamDateChange: (value: string) => void;
}

interface StudentMarksProps {
  students: EnrolledStudent[];
  searchTerm: string;
  onSearch: (value: string) => void;
  scores: Record<string, string>;
  onScoreChange: (studentId: string, value: string) => void;
  disabled: boolean;
  loading: boolean;
}

interface SavedMarksListProps {
  records: PhysicalExamMarkRecord[];
  loading: boolean;
}

export function PhysicalExamUploader({ courseId }: { courseId: string }) {
  const [examTitle, setExamTitle] = useState<string>("");
  const [examDate, setExamDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paperUrl, setPaperUrl] = useState<string | null>(null);
  const [uploadingPaper, setUploadingPaper] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [records, setRecords] = useState<PhysicalExamMarkRecord[]>([]);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(true);
  const [marksLoading, setMarksLoading] = useState<boolean>(true);
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    let active = true;

    const loadStudents = async () => {
      setStudentsLoading(true);
      try {
        const loaded = await getEnrolledStudentsForCourse(courseId);
        if (active) {
          setStudents(loaded);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load enrolled students.");
      } finally {
        if (active) {
          setStudentsLoading(false);
        }
      }
    };

    const loadMarks = async () => {
      setMarksLoading(true);
      try {
        const saved = await getPhysicalExamMarks(courseId);
        if (active) {
          setRecords(saved);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load saved marks.");
      } finally {
        if (active) {
          setMarksLoading(false);
        }
      }
    };

    void loadStudents();
    void loadMarks();

    return () => {
      active = false;
    };
  }, [courseId]);

  const filteredStudents = useMemo<EnrolledStudent[]>(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter(
      (student) =>
        student.studentName.toLowerCase().includes(query) ||
        student.studentPublicId.toLowerCase().includes(query)
    );
  }, [students, searchTerm]);

  const marksReady = Boolean(examTitle.trim() && paperUrl);

  const handleScoreChange = (studentId: string, value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    setScores((previous) => ({
      ...previous,
      [studentId]: value,
    }));
  };

  const handleSaveMarks = () => {
    if (!marksReady || !paperUrl) {
      toast.error("Add an exam title and upload the paper first.");
      return;
    }

    const validEntries = students
      .map((student) => {
        const value = scores[student.registrationId];
        if (!value) return null;

        const parsedScore = Number.parseFloat(value);
        if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
          return null;
        }

        return {
          studentRegistrationId: student.registrationId,
          score: parsedScore,
        };
      })
      .filter(
        (entry): entry is { studentRegistrationId: string; score: number } =>
          entry !== null
      );

    if (validEntries.length === 0) {
      toast.error("Enter at least one valid score between 0 and 100.");
      return;
    }

    startSaving(() =>
      savePhysicalExamMarks({
        courseId,
        examTitle: examTitle.trim(),
        examDate,
        paperUrl,
        scores: validEntries,
      }).then((result) => {
        if (!result.success) {
          toast.error(result.message);
          return;
        }

        setRecords(result.records);
        toast.success("Physical exam marks saved.");
      })
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle>Physical Exam Paper</CardTitle>
          <CardDescription>
            Enter the exam title, date, upload the scanned paper, and then
            record marks for enrolled students in this course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExamPaperUpload
            courseId={courseId}
            examTitle={examTitle}
            onExamTitleChange={setExamTitle}
            paperUrl={paperUrl}
            onUploadComplete={(payload) => {
              setPaperUrl(payload.url);
            }}
            uploading={uploadingPaper}
            onUploadingChange={setUploadingPaper}
            examDate={examDate}
            onExamDateChange={setExamDate}
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle>Enter student marks</CardTitle>
          <CardDescription>
            Search enrolled students by name or ID, then enter their marks.
            Marks are enabled after the exam paper is uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StudentMarks
            students={filteredStudents}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            scores={scores}
            onScoreChange={handleScoreChange}
            disabled={
              !marksReady || studentsLoading || uploadingPaper || saving
            }
            loading={studentsLoading}
          />

          <div className="flex justify-end">
            <Button onClick={handleSaveMarks} disabled={!marksReady || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save marks
            </Button>
          </div>
        </CardContent>
      </Card>

      <SavedMarksList records={records} loading={marksLoading} />
    </div>
  );
}

function ExamPaperUpload({
  courseId,
  examTitle,
  onExamTitleChange,
  paperUrl,
  onUploadComplete,
  uploading,
  onUploadingChange,
  examDate,
  onExamDateChange,
}: ExamPaperUploadProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exam-title" className="text-sm font-semibold">
            Exam title
          </Label>
          <Input
            id="exam-title"
            value={examTitle}
            onChange={(event) => onExamTitleChange(event.target.value)}
            placeholder="e.g., Annual Physical Assessment"
            className="h-10 md:h-12 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-date" className="text-sm font-semibold">
            Exam date
          </Label>
          <Input
            id="exam-date"
            type="date"
            value={examDate}
            onChange={(event) => onExamDateChange(event.target.value)}
            className="h-10 md:h-12 text-base"
            required
          />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
          <UploadCloud className="h-5 w-5 text-primary animate-pulse" />
          <p className="text-xs text-muted-foreground leading-snug">
            {paperUrl
              ? "Physical paper has been successfully uploaded and is ready for grading."
              : "Enter exam title, date and upload the physical exam paper (PDF)"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Upload exam paper</Label>
        {examTitle.trim() ? (
          <UploadDropzone
            endpoint="physicalExamPaper"
            input={{
              courseId,
              examTitle: examTitle.trim(),
              examDate,
            }}
            onUploadBegin={() => {
              onUploadingChange(true);
            }}
            onClientUploadComplete={(res) => {
              onUploadingChange(false);
              const result = res?.[0];
              if (result?.url) {
                onUploadComplete({ url: result.url });
                toast.success("Exam paper uploaded and saved.");
              }
            }}
            onUploadError={(error) => {
              onUploadingChange(false);
              toast.error(error.message);
            }}
            appearance={{
              container:
                "border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/30 py-8 transition-colors hover:border-primary/50 hover:bg-muted/50",
              label: "text-sm text-muted-foreground",
              uploadIcon: "text-primary h-8 w-8",
              button:
                "bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 mt-4",
            }}
            content={{
              label({ isUploading }) {
                if (isUploading) return "Uploading paper...";
                if (paperUrl) return "Paper uploaded. Click to replace.";
                return "Drag & drop or click to upload paper";
              },
              allowedContent: "PDF (max 64MB)",
            }}
            disabled={uploading}
          />
        ) : (
          <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted/50 bg-muted/10 p-8 text-center transition-all duration-300">
            <div className="rounded-full bg-muted/20 p-4">
              <UploadCloud className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Upload Locked
              </p>
              <p className="text-xs text-muted-foreground/70 max-w-[200px] leading-relaxed">
                Please enter an exam title to enable the upload area
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentMarks({
  students,
  searchTerm,
  onSearch,
  scores,
  onScoreChange,
  disabled,
  loading,
}: StudentMarksProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search students by name or ID"
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading enrolled students…
          </p>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No enrolled students found for this course.
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.registrationId}
              className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card/60 p-2 px-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {student.studentPublicId}
                  </Badge>
                  <span className="font-semibold text-foreground text-sm md:text-base">
                    {student.studentName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:min-w-[180px] md:min-w-[220px]">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={scores[student.registrationId] ?? ""}
                    onChange={(event) =>
                      onScoreChange(student.registrationId, event.target.value)
                    }
                    placeholder="Score"
                    className="h-9 md:h-10 pr-8"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SavedMarksList({ records, loading }: SavedMarksListProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Saved marks</CardTitle>
          <CardDescription>
            Loading previously saved physical exam scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fetching saved grades…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Saved marks</CardTitle>
          <CardDescription>
            Saved grades for physical exams will appear here once added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No saved marks yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Saved marks</CardTitle>
        <CardDescription>
          Recently recorded physical exam scores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card/70 p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider"
                >
                  {record.examTitle}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20"
                >
                  {new Date(record.examDate).toLocaleDateString([], {
                    dateStyle: "medium",
                  })}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {record.studentPublicId}
                </Badge>
                <span className="font-semibold text-foreground text-sm">
                  {record.studentName}
                </span>
                <Badge
                  variant={record.score >= 75 ? "default" : "outline"}
                  className={
                    record.score >= 75
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : ""
                  }
                >
                  {record.score}%
                </Badge>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="font-medium text-foreground/70">
                    Saved on:
                  </span>{" "}
                  {new Date(record.recordedAt).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[250px] flex items-center gap-1">
                  <span className="font-medium text-foreground/70">Paper:</span>{" "}
                  {record.paperUrl}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
