"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Users, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
  type StudentRecord,
} from "@/lib/actions/eims-user-management";
import {
  studentCreateSchema,
  studentUpsertSchema,
  type StudentCreateValues,
  type StudentUpsertValues,
} from "@/lib/validators/eims-user-management";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserAddForm, UserEditForm, type UserFieldConfig } from "./UserForms";
import { UserFormDialog } from "./UserFormDialog";
import { UserManagementCard } from "./UserManagementCard";
import { UserTable } from "./UserTable";
import {
  clearFieldError,
  collectFieldErrors,
  genderOptions,
  statusOptions,
  type FieldErrorState,
} from "./form-utils";

type StudentCreateErrorState = FieldErrorState<StudentCreateValues>;
type StudentEditErrorState = FieldErrorState<StudentUpsertValues>;

const studentCreateFields: UserFieldConfig<StudentCreateValues>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "parentEmail", label: "Parent Email", type: "email" },
  { key: "studentPublicId", label: "Student ID", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: genderOptions },
  { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "password", label: "Password", type: "password" },
  { key: "profileImage", label: "Profile Image", type: "image" },
];

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

const createEmptyStudent = (): StudentCreateValues => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  parentEmail: "",
  studentPublicId: "",
  status: "ACTIVE",
  password: "",
  dob: "",
  gender: undefined,
  profileImage: "",
});

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<StudentUpsertValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);
  const [newStudent, setNewStudent] =
    useState<StudentCreateValues>(createEmptyStudent);
  const [isPending, startTransition] = useTransition();
  const [editStudentPassword, setEditStudentPassword] = useState("");
  const [newStudentErrors, setNewStudentErrors] =
    useState<StudentCreateErrorState>({});
  const [editStudentErrors, setEditStudentErrors] =
    useState<StudentEditErrorState>({});
  const [viewingIdCardUrl, setViewingIdCardUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      setIsLoading(true);
      const result = await listStudents();

      if (!isMounted) return;

      if (result.success) {
        setStudents(result.data);
        setListError(null);
      } else {
        setStudents([]);
        setListError(result.error);
        toast.error(result.error);
      }

      setIsLoading(false);
    };

    void fetchStudents();

    return () => {
      isMounted = false;
    };
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

  const handleCreateStudent = () => {
    const validation = studentCreateSchema.safeParse(newStudent);

    if (!validation.success) {
      setNewStudentErrors(
        collectFieldErrors<StudentCreateValues>(validation.error.issues)
      );
      toast.error(
        validation.error.issues[0]?.message ??
          "Please correct the highlighted fields."
      );
      return;
    }

    setNewStudentErrors({});

    startTransition(async () => {
      const result = await createStudent(validation.data);

      if (result.success) {
        setStudents((prev) => [result.data, ...prev]);
        setNewStudent(createEmptyStudent());
        setIsAddDialogOpen(false);
        toast.success("Student added successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleNewStudentChange = <Key extends keyof StudentCreateValues>(
    key: Key,
    value: StudentCreateValues[Key]
  ) => {
    setNewStudent((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key, setNewStudentErrors);
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
        <span className="text-xs">
          {student.studentPublicId ?? "-"}
        </span>
      </TableCell>
      <TableCell className="text-sm">{student.name}</TableCell>
      <TableCell className="text-sm">{student.email}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {student.enrollments.length > 0 ? (
            student.enrollments.map((e) => (
              <Badge key={e.id} variant="outline" className="text-[10px]">
                {e.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">
            {(
              student.payments.reduce((sum, p) => sum + p.amountInCents, 0) /
              100
            ).toLocaleString(undefined, {
              style: "currency",
              currency: student.payments[0]?.currency ?? "LKR",
            })}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {student.payments.length} transactions
          </span>
        </div>
      </TableCell>
      <TableCell>
        {student.idCardUrl ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingIdCardUrl(student.idCardUrl)}
            disabled={isPending}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
          {student.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border border-zinc-200 bg-zinc-900 px-4 text-xs font-medium text-zinc-100 hover:bg-zinc-800 hover:text-white dark:border-zinc-800"
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

  return (
    <>
      <UserManagementCard
        title="Student Management"
        description="Manage student profiles, credentials, and account status."
        icon={Users}
        addLabel="Add Student"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddDialogOpen(true)}
        isLoading={isPending}
      >
        <UserTable
          headers={[
            "Student ID",
            "Name",
            "Email",
            "Courses",
            "Payments",
            "ID Card",
            "Status",
            "Actions",
          ]}
          isLoading={isLoading}
          error={listError}
          emptyMessage="No students found."
        >
          {rows}
        </UserTable>
      </UserManagementCard>

      <UserFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add Student"
        description="Create a new student account and assign credentials."
        onSubmit={handleCreateStudent}
        submitLabel="Create"
        isPending={isPending}
      >
        <UserAddForm
          values={newStudent}
          errors={newStudentErrors}
          fields={studentCreateFields}
          onChange={handleNewStudentChange}
          onClearError={(key) => clearFieldError(key, setNewStudentErrors)}
        />
      </UserFormDialog>

      <UserFormDialog
        open={Boolean(editingStudent)}
        onOpenChange={(open) => {
          if (!open) setEditingStudent(null);
        }}
        title="Edit Student"
        description="Update student details or reset their credentials."
        onSubmit={handleUpdateStudent}
        submitLabel="Save Changes"
        isPending={isPending}
      >
        {editingStudent ? (
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
        ) : null}
      </UserFormDialog>

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

      <Dialog
        open={Boolean(viewingIdCardUrl)}
        onOpenChange={(open) => {
          if (!open) setViewingIdCardUrl(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student ID Card</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-hidden rounded-xl border bg-muted shadow-lg">
            {viewingIdCardUrl && (
              <Image
                src={viewingIdCardUrl}
                alt="Student ID card"
                width={960}
                height={560}
                className="h-auto w-full"
                unoptimized
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
