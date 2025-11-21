"use client";

import { useMemo, useState } from "react";
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
import { useStudentRegistrations } from "@/hooks/useData";

type StudentSummary = {
  id: string;
  name: string;
};

type SavedMarkRecord = {
  studentId: string;
  studentName: string;
  score: number;
  examTitle: string;
  paperUrl: string;
  savedAt: string;
};

interface ExamPaperUploadProps {
  courseId: string;
  examTitle: string;
  onExamTitleChange: (value: string) => void;
  paperUrl: string | null;
  onUploadComplete: (payload: { url: string; materialId?: string }) => void;
  uploading: boolean;
  onUploadingChange: (value: boolean) => void;
}

interface StudentMarksProps {
  students: StudentSummary[];
  searchTerm: string;
  onSearch: (value: string) => void;
  scores: Record<string, string>;
  onScoreChange: (studentId: string, value: string) => void;
  disabled: boolean;
}

interface SavedMarksListProps {
  records: SavedMarkRecord[];
}

export function PhysicalExamUploader({ courseId }: { courseId: string }) {
  const { registrations, loading: studentsLoading } = useStudentRegistrations();

  const [examTitle, setExamTitle] = useState<string>("");
  const [paperUrl, setPaperUrl] = useState<string | null>(null);
  const [paperMaterialId, setPaperMaterialId] = useState<string | null>(null);
  const [uploadingPaper, setUploadingPaper] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [records, setRecords] = useState<SavedMarkRecord[]>([]);

  const enrolledStudents = useMemo<StudentSummary[]>(() => {
    return registrations
      .filter((registration) =>
        Array.isArray(registration.courses)
          ? registration.courses.includes(courseId)
          : false
      )
      .map((registration) => ({
        id: registration.studentPublicId ?? registration.id,
        name: registration.name,
      }));
  }, [courseId, registrations]);

  const filteredStudents = useMemo<StudentSummary[]>(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return enrolledStudents;
    }

    return enrolledStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query)
    );
  }, [enrolledStudents, searchTerm]);

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
    if (!marksReady) {
      toast.error("Add an exam title and upload the paper first.");
      return;
    }

    const validEntries: SavedMarkRecord[] = [];

    enrolledStudents.forEach((student) => {
      const value = scores[student.id];
      if (!value) {
        return;
      }

      const parsedScore = Number.parseFloat(value);
      if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
        return;
      }

      validEntries.push({
        studentId: student.id,
        studentName: student.name,
        score: parsedScore,
        examTitle: examTitle.trim(),
        paperUrl: paperUrl!,
        savedAt: new Date().toISOString(),
      });
    });

    if (validEntries.length === 0) {
      toast.error("Enter at least one valid score between 0 and 100.");
      return;
    }

    setSaving(true);
    setRecords((previous) => [...validEntries, ...previous]);
    toast.success("Physical exam marks saved.");
    setSaving(false);
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
              setPaperMaterialId(payload.materialId ?? null);
            }}
            uploading={uploadingPaper}
            onUploadingChange={setUploadingPaper}
          />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {paperMaterialId ? (
              <Badge variant="secondary">File saved to library</Badge>
            ) : (
              <Badge variant="outline">Upload creates a saved record</Badge>
            )}
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
            disabled={!marksReady || studentsLoading || uploadingPaper}
          />

          <div className="flex justify-end">
            <Button onClick={handleSaveMarks} disabled={!marksReady || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save marks
            </Button>
          </div>
        </CardContent>
      </Card>

      <SavedMarksList records={records} />
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
            button: "w-full justify-center",
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
              const materialId =
                typeof result.serverData === "object" && result.serverData
                  ? (result.serverData as { materialId?: string }).materialId
                  : undefined;

              onUploadComplete({ url: result.url, materialId });
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
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No enrolled students found for this course.
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{student.id}</Badge>
                  <span className="font-semibold text-foreground">{student.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">Course enrollment verified</p>
              </div>

              <div className="flex items-center gap-2 md:min-w-[220px]">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={scores[student.id] ?? ""}
                  onChange={(event) => onScoreChange(student.id, event.target.value)}
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

function SavedMarksList({ records }: SavedMarksListProps) {
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
            key={`${record.studentId}-${record.savedAt}`}
            className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{record.examTitle}</Badge>
                <span className="font-semibold text-foreground">
                  {record.studentName}
                </span>
                <Badge variant={record.score >= 75 ? "default" : "outline"}>
                  {record.score}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Saved on {new Date(record.savedAt).toLocaleString()}
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
