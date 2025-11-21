import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

interface PhysicalExamUploaderProps {
  courseId: string;
}

type PhysicalExamFormState = {
  studentName: string;
  examTitle: string;
  score: string;
  file: File | null;
  notes: string;
};

type PhysicalExamRecord = {
  id: string;
  studentName: string;
  examTitle: string;
  score: number;
  fileName: string;
  uploadedAt: string;
  notes?: string;
};

const DEFAULT_FORM: PhysicalExamFormState = {
  studentName: "",
  examTitle: "",
  score: "",
  file: null,
  notes: "",
};

export function PhysicalExamUploader({ courseId }: PhysicalExamUploaderProps) {
  const [formState, setFormState] = useState<PhysicalExamFormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [records, setRecords] = useState<PhysicalExamRecord[]>([
    {
      id: "PX-001",
      studentName: "Ava Thompson",
      examTitle: "Physical Fitness Assessment",
      score: 88,
      fileName: "fitness-assessment.pdf",
      uploadedAt: new Date().toISOString(),
      notes: "Cleared with minor recommendations",
    },
  ]);

  const averageScore = useMemo(() => {
    if (records.length === 0) {
      return 0;
    }

    const total = records.reduce((sum, record) => sum + record.score, 0);
    return Math.round((total / records.length) * 10) / 10;
  }, [records]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.studentName.trim() || !formState.examTitle.trim()) {
      toast.error("Student name and exam title are required");
      return;
    }

    const numericScore = Number.parseFloat(formState.score);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    if (!formState.file) {
      toast.error("Please upload the physical exam paper");
      return;
    }

    setIsSubmitting(true);

    const newRecord: PhysicalExamRecord = {
      id: `PX-${String(records.length + 1).padStart(3, "0")}`,
      studentName: formState.studentName.trim(),
      examTitle: formState.examTitle.trim(),
      score: numericScore,
      fileName: formState.file.name,
      uploadedAt: new Date().toISOString(),
      notes: formState.notes.trim() || undefined,
    };

    setRecords((previous) => [newRecord, ...previous]);
    setFormState(DEFAULT_FORM);
    toast.success("Physical exam marks uploaded successfully");
    setIsSubmitting(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormState((previous) => ({ ...previous, file }));
  };

  const uploadProgress = useMemo(() => {
    if (!isSubmitting) {
      return 0;
    }

    return 100;
  }, [isSubmitting]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Physical Exam Marks</h3>
          <p className="text-sm text-muted-foreground">
            Upload scanned physical exam papers and record marks for each student
            in this course.
          </p>
          <p className="text-xs text-muted-foreground">Course ID: {courseId}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Average score: {averageScore}%
        </Badge>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Upload physical exam paper</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student name</Label>
                <Input
                  id="studentName"
                  value={formState.studentName}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      studentName: event.target.value,
                    }))
                  }
                  placeholder="e.g., John Carter"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examTitle">Exam title</Label>
                <Input
                  id="examTitle"
                  value={formState.examTitle}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      examTitle: event.target.value,
                    }))
                  }
                  placeholder="e.g., Annual Physical Assessment"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="score">Score (%)</Label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={formState.score}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      score: event.target.value,
                    }))
                  }
                  placeholder="e.g., 92"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Physical exam paper</Label>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/80 bg-muted/40 p-3">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  <UploadCloud className="h-5 w-5 text-muted-foreground" />
                </div>
                {formState.file && (
                  <p className="text-xs text-muted-foreground">
                    Selected file: {formState.file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formState.notes}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Add remarks or follow-up instructions"
              />
            </div>

            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading exam paper...
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Recent physical exam uploads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No physical exam marks uploaded for this course yet.
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{record.examTitle}</Badge>
                    <span className="text-sm font-semibold text-foreground">
                      {record.studentName}
                    </span>
                    <Badge variant={record.score >= 75 ? "default" : "outline"}>
                      Score: {record.score}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on {new Date(record.uploadedAt).toLocaleString()}
                    {record.notes ? ` • ${record.notes}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    File: {record.fileName}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View file
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

