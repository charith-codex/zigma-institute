"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Users, Edit, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
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
import { Pagination } from "./Pagination";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchStudents = async (page: number, search: string) => {
    setIsLoading(true);
    const result = await listStudents({
      page,
      pageSize,
      searchTerm: search,
    });

    if (result.success) {
      setStudents(result.data.data);
      setTotalCount(result.data.totalCount);
      setListError(null);
    } else {
      setStudents([]);
      setTotalCount(0);
      setListError(result.error);
      toast.error(result.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    void fetchStudents(1, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchStudents(currentPage, debouncedSearch);
  }, [currentPage]);

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

  const rows = students.map((student) => (
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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
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
