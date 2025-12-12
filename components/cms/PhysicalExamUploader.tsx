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
import { UploadButton } from "@/lib/uploadthing";
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

        return { studentRegistrationId: student.registrationId, score: parsedScore };
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
            Enter the exam title, upload the scanned paper, and then record
            marks for enrolled students in this course.
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
          />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Upload ready for grading</Badge>
            <span>Course ID: {courseId}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle>Enter student marks</CardTitle>
          <CardDescription>
            Search enrolled students by name or ID, then enter their marks out
            of 100. Marks are enabled after the exam paper is uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StudentMarks
            students={filteredStudents}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            scores={scores}
            onScoreChange={handleScoreChange}
            disabled={!marksReady || studentsLoading || uploadingPaper || saving}
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
}: ExamPaperUploadProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[2fr,1fr] md:items-end">
      <div className="space-y-2">
        <Label htmlFor="exam-title">Exam title</Label>
        <Input
          id="exam-title"
          value={examTitle}
          onChange={(event) => onExamTitleChange(event.target.value)}
          placeholder="e.g., Annual Physical Assessment"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Upload exam paper</Label>
        <UploadButton
          endpoint="physicalExamPaper"
          input={{ courseId, examTitle: examTitle.trim() }}
          appearance={{
            button: "px-6 justify-center bg-primary",
          }}
          disabled={!examTitle.trim() || uploading}
          content={{
            button({ ready }) {
              if (uploading) return "Uploading...";
              if (!ready) return "Connecting...";
              return paperUrl ? "Replace paper" : "Upload paper";
            },
          }}
          onUploadBegin={() => {
            if (!examTitle.trim()) {
              toast.error("Enter the exam title before uploading.");
              return false;
            }

            onUploadingChange(true);
            return undefined;
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
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UploadCloud className="h-4 w-4" />
          {paperUrl ? "File ready for grading" : "PDF or images, up to 64MB"}
        </div>
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
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{student.studentPublicId}</Badge>
                  <span className="font-semibold text-foreground">
                    {student.studentName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Course enrollment verified</p>
              </div>

              <div className="flex items-center gap-2 md:min-w-[220px]">
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
                  disabled={disabled}
                />
                {!disabled ? null : (
                  <Badge variant="outline" className="text-[11px]">
                    Upload required
                  </Badge>
                )}
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
          <p className="text-sm text-muted-foreground">Fetching saved grades…</p>
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
        <CardDescription>Recently recorded physical exam scores.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{record.examTitle}</Badge>
                <Badge variant="outline">{record.studentPublicId}</Badge>
                <span className="font-semibold text-foreground">
                  {record.studentName}
                </span>
                <Badge variant={record.score >= 75 ? "default" : "outline"}>
                  {record.score}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Saved on {new Date(record.recordedAt).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Paper URL: {record.paperUrl}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={record.paperUrl} target="_blank" rel="noreferrer">
                View paper
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
