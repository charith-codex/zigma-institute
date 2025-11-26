"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Users, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

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

export function StudentManagement() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);
  const [newStudent, setNewStudent] =
    useState<StudentCreateValues>(createEmptyStudent);
  const [isPending, startTransition] = useTransition();
  const [editStudentPassword, setEditStudentPassword] = useState("");
  const [newStudentErrors, setNewStudentErrors] =
    useState<StudentCreateErrorState>({});
  const [editStudentErrors, setEditStudentErrors] =
    useState<StudentEditErrorState>({});

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
        setStudents(result.data);
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
        setStudents(result.data);
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
        setStudents(result.data);
        setDeleteTarget(null);
        toast.success("Student removed successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const rows = filteredStudents.map((student) => (
    <TableRow key={student.id}>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>{student.email}</TableCell>
      <TableCell>{student.parentEmail ?? "-"}</TableCell>
      <TableCell>
        <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
          {student.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditingStudent(student)}
          disabled={isPending}
        >
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteTarget(student)}
          disabled={isPending}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Delete
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
          headers={["Name", "Email", "Parent Email", "Status", "Actions"]}
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
    </>
  );
}
