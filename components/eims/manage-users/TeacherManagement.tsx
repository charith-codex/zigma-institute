"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { GraduationCap, ArrowLeft, UserPlus, Edit } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

import {
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher,
  type TeacherRecord,
} from "@/lib/actions/eims-user-management";
import {
  teacherCreateSchema,
  teacherUpsertSchema,
  type TeacherCreateValues,
  type TeacherUpsertValues,
} from "@/lib/validators/eims-user-management";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserAddForm, UserEditForm, type UserFieldConfig } from "./UserForms";
import { UserManagementCard } from "./UserManagementCard";
import { UserTable } from "./UserTable";
import {
  clearFieldError,
  collectFieldErrors,
  genderOptions,
  statusOptions,
  type FieldErrorState,
} from "./form-utils";
import { Pagination } from "./Pagination";
import { useDebounce } from "@/hooks/use-debounce";

type TeacherCreateErrorState = FieldErrorState<TeacherCreateValues>;
type TeacherEditErrorState = FieldErrorState<TeacherUpsertValues>;

const teacherCreateFields: UserFieldConfig<TeacherCreateValues>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "qualification", label: "Qualification", type: "text" },
  { key: "nic", label: "NIC", type: "text" },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: genderOptions },
  { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "password", label: "Password", type: "password" },
  { key: "profileImage", label: "Profile Image", type: "image" },
];

const teacherEditFields: UserFieldConfig<TeacherUpsertValues>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "qualification", label: "Qualification", type: "text" },
  { key: "nic", label: "NIC", type: "text" },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: genderOptions },
  { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "profileImage", label: "Profile Image", type: "image" },
];

const createEmptyTeacher = (): TeacherCreateValues => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  qualification: "",
  nic: "",
  status: "ACTIVE",
  password: "",
  dob: "",
  gender: undefined,
  profileImage: "",
});

const toTeacherUpsertValues = (
  teacher: TeacherRecord
): TeacherUpsertValues => ({
  id: teacher.id,
  name: teacher.name,
  email: teacher.email,
  phone: teacher.phone ?? "",
  address: teacher.address ?? "",
  qualification: teacher.qualification ?? "",
  nic: teacher.nic ?? "",
  status: teacher.status,
  dob: teacher.dob ?? "",
  gender: teacher.gender ?? "",
  profileImage: teacher.profileImage ?? "",
});

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] =
    useState<TeacherUpsertValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherRecord | null>(null);
  const [newTeacher, setNewTeacher] =
    useState<TeacherCreateValues>(createEmptyTeacher);
  const [isPending, startTransition] = useTransition();
  const [editTeacherPassword, setEditTeacherPassword] = useState("");
  const [newTeacherErrors, setNewTeacherErrors] =
    useState<TeacherCreateErrorState>({});
  const [editTeacherErrors, setEditTeacherErrors] =
    useState<TeacherEditErrorState>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchTeachers = async (page: number, search: string) => {
    setIsLoading(true);
    const result = await listTeachers({
      page,
      pageSize,
      searchTerm: search,
    });

    if (result.success) {
      setTeachers(result.data.data);
      setTotalCount(result.data.totalCount);
      setListError(null);
    } else {
      setTeachers([]);
      setTotalCount(0);
      setListError(result.error);
      toast.error(result.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    void fetchTeachers(1, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchTeachers(currentPage, debouncedSearch);
  }, [currentPage]);

  useEffect(() => {
    setEditTeacherPassword("");
    setEditTeacherErrors({});
  }, [editingTeacher]);

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return teachers;

    return teachers.filter((teacher) => {
      const haystacks = [teacher.name, teacher.email, teacher.qualification]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(term));
    });
  }, [teachers, searchTerm]);

  const handleCreateTeacher = () => {
    const validation = teacherCreateSchema.safeParse(newTeacher);

    if (!validation.success) {
      setNewTeacherErrors(
        collectFieldErrors<TeacherCreateValues>(validation.error.issues)
      );
      toast.error(
        validation.error.issues[0]?.message ??
          "Please correct the highlighted fields."
      );
      return;
    }

    setNewTeacherErrors({});

    startTransition(async () => {
      const result = await createTeacher(validation.data);

      if (result.success) {
        setTeachers((prev) => [result.data, ...prev]);
        setNewTeacher(createEmptyTeacher());
        setIsAddingTeacher(false);
        toast.success("Teacher added successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleNewTeacherChange = <Key extends keyof TeacherCreateValues>(
    key: Key,
    value: TeacherCreateValues[Key]
  ) => {
    setNewTeacher((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key, setNewTeacherErrors);
  };

  const handleUpdateTeacher = () => {
    if (!editingTeacher) return;

    const validation = teacherUpsertSchema.safeParse({
      ...editingTeacher,
      password: editTeacherPassword,
    });

    if (!validation.success) {
      setEditTeacherErrors(
        collectFieldErrors<TeacherUpsertValues>(validation.error.issues)
      );
      toast.error(
        validation.error.issues[0]?.message ??
          "Please correct the highlighted fields."
      );
      return;
    }

    setEditTeacherErrors({});

    startTransition(async () => {
      const result = await updateTeacher(validation.data);

      if (result.success) {
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.id === result.data.id ? result.data : teacher
          )
        );
        setEditingTeacher(null);
        toast.success("Teacher updated successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEditTeacherChange = <Key extends keyof TeacherUpsertValues>(
    key: Key,
    value: TeacherUpsertValues[Key]
  ) => {
    setEditingTeacher((prev) => (prev ? { ...prev, [key]: value } : prev));
    clearFieldError(key, setEditTeacherErrors);
  };

  const handleDeleteTeacher = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteTeacher(deleteTarget.id);

      if (result.success) {
        setTeachers((prev) =>
          prev.filter((teacher) => teacher.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
        toast.success("Teacher removed successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const rows = teachers.map((teacher) => (
    <TableRow key={teacher.id}>
      <TableCell className="font-medium">{teacher.name}</TableCell>
      <TableCell>{teacher.email}</TableCell>
      <TableCell>{teacher.qualification || "-"}</TableCell>
      <TableCell>
        <Badge
          variant={teacher.status === "ACTIVE" ? "default" : "secondary"}
          className={teacher.status === "ACTIVE" ? "bg-green-700" : ""}
        >
          {teacher.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="flex gap-4">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-4 text-xs font-medium hover:bg-zinc-800 hover:text-white"
          onClick={() => setEditingTeacher(toTeacherUpsertValues(teacher))}
          disabled={isPending}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 rounded-lg bg-[#b44b4b] px-4 text-xs font-medium text-white hover:bg-[#a34141] border-none shadow-none"
          onClick={() => setDeleteTarget(teacher)}
          disabled={isPending}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  ));

  if (isAddingTeacher) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center text-[#A41FC5]">
            <UserPlus className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold">Add Teacher</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddingTeacher(false)}
            className="rounded-lg bg-[#A41FC5] hover:bg-[#A41FC5]/90 px-4 text-xs font-medium text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teacher Management
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <UserAddForm
            values={newTeacher}
            errors={newTeacherErrors}
            fields={teacherCreateFields}
            onChange={handleNewTeacherChange}
            onClearError={(key) => clearFieldError(key, setNewTeacherErrors)}
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddingTeacher(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTeacher}
              disabled={isPending}
              className="bg-[#A41FC5] hover:bg-[#A41FC5]/90 text-white"
            >
              {isPending ? "Creating..." : "Create Teacher"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (editingTeacher) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center text-[#A41FC5]">
            <Edit className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold">Edit Teacher</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setEditingTeacher(null)}
            className="rounded-lg bg-[#A41FC5] hover:bg-[#A41FC5]/90 px-4 text-xs font-medium text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teacher Management
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <UserEditForm
            values={editingTeacher}
            errors={editTeacherErrors}
            fields={teacherEditFields}
            onChange={handleEditTeacherChange}
            onClearError={(key) => clearFieldError(key, setEditTeacherErrors)}
            passwordValue={editTeacherPassword}
            passwordLabel="Reset Password"
            passwordDescription="Leave empty to keep the existing password."
            passwordError={editTeacherErrors.password}
            onPasswordChange={(value) => {
              setEditTeacherPassword(value);
              clearFieldError("password", setEditTeacherErrors);
            }}
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditingTeacher(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTeacher}
              disabled={isPending}
              className="bg-[#A41FC5] hover:bg-[#A41FC5]/90 text-white"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserManagementCard
        title="Teacher Management"
        description="Handle teacher accounts, roles, and availability."
        icon={GraduationCap}
        addLabel="Add Teacher"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddingTeacher(true)}
        isLoading={isPending}
      >
        <UserTable
          headers={["Name", "Email", "Qualification", "Status", "Actions"]}
          isLoading={isLoading}
          error={listError}
          emptyMessage="No teachers found."
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
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteTeacher}
        isPending={isPending}
      />
    </>
  );
}
