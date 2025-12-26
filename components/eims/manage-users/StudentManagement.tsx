"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Users,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  UserPlus,
  Download,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  StudentRegistrationForm,
  type StudentRegistrationCourse,
} from "@/components/student-registration/RegistrationForm";
import { getCourses } from "@/lib/actions/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  deleteStudent,
  listStudents,
  updateStudent,
  type StudentRecord,
} from "@/lib/actions/eims-user-management";
import {
  studentUpsertSchema,
  type StudentUpsertValues,
} from "@/lib/validators/eims-user-management";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserEditForm, type UserFieldConfig } from "./UserForms";
import { UserFormDialog } from "./UserFormDialog";
import { UserManagementCard } from "./UserManagementCard";
import { UserTable } from "./UserTable";
import { StudentDetailView } from "./StudentDetailView";
import {
  clearFieldError,
  collectFieldErrors,
  genderOptions,
  statusOptions,
  type FieldErrorState,
} from "./form-utils";
import { FlowerLoader } from "@/components/ui/flower-loader";

type StudentEditErrorState = FieldErrorState<StudentUpsertValues>;

const studentEditFields: UserFieldConfig<StudentUpsertValues>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "parentEmail", label: "Parent Email", type: "email" },
  { key: "studentPublicId", label: "Student ID", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: genderOptions },
  { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "profileImage", label: "Profile Image", type: "image" },
];

const toStudentUpsertValues = (
  student: StudentRecord
): StudentUpsertValues => ({
  id: student.id,
  name: student.name,
  email: student.email,
  phone: student.phone ?? "",
  address: student.address ?? "",
  status: student.status,
  parentEmail: student.parentEmail ?? "",
  studentPublicId: student.studentPublicId ?? "",
  dob: student.dob ?? "",
  gender: student.gender ?? "",
  profileImage: student.profileImage ?? "",
});

export function StudentManagement() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationCourses, setRegistrationCourses] = useState<
    StudentRegistrationCourse[]
  >([]);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    studentPublicId?: string | null;
    temporaryPassword?: string;
    idCardUrl?: string | null;
  } | null>(null);
  const [editingStudent, setEditingStudent] =
    useState<StudentUpsertValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editStudentPassword, setEditStudentPassword] = useState("");
  const [editStudentErrors, setEditStudentErrors] =
    useState<StudentEditErrorState>({});
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(
    null
  );

  const fetchStudents = async () => {
    setIsLoading(true);
    const result = await listStudents();

    setStudents(result.success ? result.data : []);
    setListError(result.success ? null : result.error);
    if (!result.success) toast.error(result.error);

    setIsLoading(false);
  };

  useEffect(() => {
    void fetchStudents();
  }, []);

  useEffect(() => {
    setEditStudentPassword("");
    setEditStudentErrors({});
  }, [editingStudent]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return students;
    }

    return students.filter((student) => {
      const haystacks = [
        student.name,
        student.email,
        student.parentEmail ?? "",
        student.studentPublicId ?? "",
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(term));
    });
  }, [students, searchTerm]);

  const handleOpenRegistration = async () => {
    setShowRegistration(true);
    setRegistrationSuccess(null);
    if (registrationCourses.length === 0) {
      setIsFetchingCourses(true);
      try {
        const data = await getCourses();
        setRegistrationCourses(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            priceInCents: c.priceInCents,
            currency: c.currency,
            teacherName: c.teacherName,
          }))
        );
      } catch (error) {
        toast.error("Failed to load courses for registration");
      } finally {
        setIsFetchingCourses(false);
      }
    }
  };

  const handleBackToList = () => {
    setShowRegistration(false);
    setRegistrationSuccess(null);
    void fetchStudents();
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    const validation = studentUpsertSchema.safeParse({
      ...editingStudent,
      password: editStudentPassword,
    });

    if (!validation.success) {
      setEditStudentErrors(
        collectFieldErrors<StudentUpsertValues>(validation.error.issues)
      );
      toast.error(
        validation.error.issues[0]?.message ??
          "Please correct the highlighted fields."
      );
      return;
    }

    setEditStudentErrors({});

    startTransition(async () => {
      const result = await updateStudent(validation.data);

      if (result.success) {
        setStudents((prev) =>
          prev.map((student) =>
            student.id === result.data.id ? result.data : student
          )
        );
        setEditingStudent(null);
        toast.success("Student updated successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEditStudentChange = <Key extends keyof StudentUpsertValues>(
    key: Key,
    value: StudentUpsertValues[Key]
  ) => {
    setEditingStudent((prev) => (prev ? { ...prev, [key]: value } : prev));
    clearFieldError(key, setEditStudentErrors);
  };

  const handleDeleteStudent = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteStudent(deleteTarget.id);

      if (result.success) {
        setStudents((prev) =>
          prev.filter((student) => student.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
        toast.success("Student removed successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const rows = filteredStudents.map((student) => (
    <TableRow key={student.id}>
      <TableCell>
        <span className="text-xs">{student.studentPublicId ?? "-"}</span>
      </TableCell>
      <TableCell className="text-sm">{student.name}</TableCell>
      <TableCell className="text-sm font-medium">{student.email}</TableCell>
      <TableCell>
        <Badge
          variant={student.status === "ACTIVE" ? "default" : "secondary"}
          className={
            student.status === "ACTIVE" ? "bg-green-700 hover:bg-green-800" : ""
          }
        >
          {student.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-4 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => setViewingStudent(student)}
          disabled={isPending}
        >
          View
        </Button>
      </TableCell>
      <TableCell className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-4 text-xs font-medium hover:bg-zinc-800 hover:text-white"
          onClick={() => setEditingStudent(toStudentUpsertValues(student))}
          disabled={isPending}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 rounded-lg bg-[#b44b4b] px-4 text-xs font-medium text-white hover:bg-[#a34141] border-none shadow-none"
          onClick={() => setDeleteTarget(student)}
          disabled={isPending}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  ));

  if (showRegistration) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold">Manual Student Registration</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleBackToList}
            className="rounded-lg bg-primary px-4 text-xs font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Management
          </Button>
        </div>

        {registrationSuccess && (
          <Alert className="bg-primary/10 border-primary/20">
            <AlertTitle className="text-primary font-bold">
              Student created successfully!
            </AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p>
                Student ID:{" "}
                <span className="font-semibold">
                  {registrationSuccess.studentPublicId ?? "Pending"}
                </span>
              </p>
              {registrationSuccess.temporaryPassword ? (
                <p className="text-sm">
                  Temporary password:{" "}
                  <span className="font-mono bg-background px-2 py-0.5 border rounded">
                    {registrationSuccess.temporaryPassword}
                  </span>
                </p>
              ) : null}
              {registrationSuccess.idCardUrl && (
                <p className="text-sm text-muted-foreground italic">
                  An ID card was generated automatically and can be viewed in
                  the student list.
                </p>
              )}
              <div className="pt-2">
                <Button size="sm" onClick={handleBackToList}>
                  Return to Student List
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!isFetchingCourses ? (
          <StudentRegistrationForm
            courses={registrationCourses}
            mode="admin"
            onSuccess={(payload) => {
              setRegistrationSuccess({
                studentPublicId: payload.studentPublicId,
                temporaryPassword: payload.temporaryPassword,
                idCardUrl: payload.idCardUrl,
              });
              void fetchStudents();
            }}
          />
        ) : (
          <div className="flex items-center justify-center">
            <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
          </div>
        )}
      </div>
    );
  }

  if (editingStudent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center">
            <Edit className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold">Edit Student</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setEditingStudent(null)}
            className="rounded-lg bg-primary px-4 text-xs font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Management
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <UserEditForm
            values={editingStudent}
            errors={editStudentErrors}
            fields={studentEditFields}
            onChange={handleEditStudentChange}
            onClearError={(key) => clearFieldError(key, setEditStudentErrors)}
            passwordValue={editStudentPassword}
            passwordLabel="Reset Password"
            passwordDescription="Leave empty to keep the existing password."
            passwordError={editStudentErrors.password}
            onPasswordChange={(value) => {
              setEditStudentPassword(value);
              clearFieldError("password", setEditStudentErrors);
            }}
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditingStudent(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (viewingStudent) {
    return (
      <div className="space-y-6">
        <StudentDetailView
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      </div>
    );
  }

  return (
    <>
      <UserManagementCard
        title="Student Management"
        description="Manage student profiles, credentials, and account status."
        icon={Users}
        addLabel="Manual Student Registration"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleOpenRegistration}
        isLoading={isPending}
      >
        <UserTable
          headers={[
            "Student ID",
            "Name",
            "Email",
            "Status",
            "Full Details",
            "Actions",
          ]}
          isLoading={isLoading}
          error={listError}
          emptyMessage="No students found."
        >
          {rows}
        </UserTable>
      </UserManagementCard>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteStudent}
        isPending={isPending}
      />
    </>
  );
}
