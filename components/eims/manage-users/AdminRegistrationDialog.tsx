"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  StudentRegistrationForm,
  type StudentRegistrationCourse,
} from "@/components/student-registration/RegistrationForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCourses } from "@/lib/actions/course";

interface AdminRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminRegistrationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdminRegistrationDialogProps) {
  const [courses, setCourses] = useState<StudentRegistrationCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<{
    studentPublicId?: string | null;
    temporaryPassword?: string;
    idCardUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    if (open) {
      const fetchCourses = async () => {
        setIsLoading(true);
        const data = await getCourses();
        setCourses(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            priceInCents: c.priceInCents,
            currency: c.currency,
            teacherName: c.teacherName,
          }))
        );
        setIsLoading(false);
      };
      void fetchCourses();
      setSuccessMessage(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manual Student Registration</DialogTitle>
          <DialogDescription>
            Capture student details, enroll them into courses, and generate
            their ID card without requiring online payment.
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <AlertTitle className="text-primary font-bold">
              Student created successfully!
            </AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p>
                Student ID:{" "}
                <span className="font-semibold">
                  {successMessage.studentPublicId ?? "Pending"}
                </span>
              </p>
              {successMessage.temporaryPassword ? (
                <p className="text-sm">
                  Temporary password:{" "}
                  <span className="font-mono bg-background px-2 py-0.5 border rounded">
                    {successMessage.temporaryPassword}
                  </span>
                </p>
              ) : null}
              {successMessage.idCardUrl && (
                <p className="text-sm text-muted-foreground italic">
                  An ID card was generated automatically and can be viewed in
                  the student list.
                </p>
              )}
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && (
          <StudentRegistrationForm
            courses={courses}
            mode="admin"
            onSuccess={(payload) => {
              setSuccessMessage({
                studentPublicId: payload.studentPublicId,
                temporaryPassword: payload.temporaryPassword,
                idCardUrl: payload.idCardUrl,
              });
              onSuccess?.();
            }}
          />
        )}

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground animate-pulse">
              Loading registration data...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
