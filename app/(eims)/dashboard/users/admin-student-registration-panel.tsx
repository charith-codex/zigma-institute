"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { StudentRegistrationForm, type StudentRegistrationCourse } from "@/components/student-registration/RegistrationForm";

interface AdminStudentRegistrationPanelProps {
  courses: StudentRegistrationCourse[];
  instituteName: string;
  instituteTagline: string;
  instituteAddress: string;
}

export function AdminStudentRegistrationPanel({
  courses,
  instituteAddress,
  instituteName,
  instituteTagline,
}: AdminStudentRegistrationPanelProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<{
    studentPublicId?: string | null;
    temporaryPassword?: string;
    idCardUrl?: string | null;
  } | null>(null);

  return (
    <div className="space-y-6">
      {successMessage ? (
        <Alert>
          <AlertTitle>Student created</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Student ID: <span className="font-semibold">{successMessage.studentPublicId ?? "Pending"}</span>
            </p>
            {successMessage.temporaryPassword ? (
              <p className="text-sm">
                Temporary password: <span className="font-mono">{successMessage.temporaryPassword}</span>
              </p>
            ) : null}
            {successMessage.idCardUrl ? (
              <p className="text-sm text-muted-foreground">
                An ID card was generated automatically.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                ID card generation can be retriggered from student registrations if needed.
              </p>
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      <StudentRegistrationForm
        courses={courses}
        instituteName={instituteName}
        instituteTagline={instituteTagline}
        instituteAddress={instituteAddress}
        mode="admin"
        onSuccess={(payload) => {
          setSuccessMessage({
            studentPublicId: payload.studentPublicId,
            temporaryPassword: payload.temporaryPassword,
            idCardUrl: payload.idCardUrl,
          });
          router.refresh();
        }}
      />

      <Separator />
      <p className="text-sm text-muted-foreground">
        No online payment is required for dashboard-created students. The system assigns a student ID, generates their ID card, and enrolls them into the selected courses automatically.
      </p>
    </div>
  );
}
