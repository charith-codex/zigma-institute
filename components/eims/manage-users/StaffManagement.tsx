"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Users, Edit, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  createStaff,
  deleteStaff,
  listStaff,
  updateStaff,
  type StaffRecord,
} from "@/lib/actions/eims-user-management";
import {
  staffCreateSchema,
  staffUpsertSchema,
  type StaffCreateValues,
  type StaffUpsertValues,
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

type StaffCreateErrorState = FieldErrorState<StaffCreateValues>;
type StaffEditErrorState = FieldErrorState<StaffUpsertValues>;

const roleOptions = [
  { label: "Administrator", value: "ADMIN" as const },
  { label: "Management", value: "MANAGER" as const },
  { label: "Attendance", value: "ATTENDANCE" as const },
];

const staffCreateFields: UserFieldConfig<StaffCreateValues>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "nic", label: "NIC", type: "text" },
  { key: "role", label: "Role", type: "select", options: roleOptions },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: genderOptions },
  { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "password", label: "Password", type: "password" },
  { key: "profileImage", label: "Profile Image", type: "image" },
];

const staffEditFields: UserFieldConfig<StaffUpsertValues>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "nic", label: "NIC", type: "text" },
  { key: "role", label: "Role", type: "select", options: roleOptions },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: genderOptions },
  { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "profileImage", label: "Profile Image", type: "image" },
];

const createEmptyStaff = (): StaffCreateValues => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  nic: "",
  role: "MANAGER",
  status: "ACTIVE",
  password: "",
  dob: "",
  gender: undefined,
  profileImage: "",
});

const toStaffUpsertValues = (member: StaffRecord): StaffUpsertValues => ({
  id: member.id,
  name: member.name,
  email: member.email,
  phone: member.phone ?? "",
  address: member.address ?? "",
  nic: member.nic ?? "",
  role: member.role,
  status: member.status,
  dob: member.dob ?? "",
  gender: member.gender ?? "",
  profileImage: member.profileImage ?? "",
});

export function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUpsertValues | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<StaffRecord | null>(null);
  const [newStaff, setNewStaff] = useState<StaffCreateValues>(createEmptyStaff);
  const [isPending, startTransition] = useTransition();
  const [editStaffPassword, setEditStaffPassword] = useState("");
  const [newStaffErrors, setNewStaffErrors] = useState<StaffCreateErrorState>(
    {}
  );
  const [editStaffErrors, setEditStaffErrors] = useState<StaffEditErrorState>(
    {}
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchStaff = async (page: number, search: string) => {
    setIsLoading(true);
    const result = await listStaff({
      page,
      pageSize,
      searchTerm: search,
    });

    if (result.success) {
      setStaffMembers(result.data.data);
      setTotalCount(result.data.totalCount);
      setListError(null);
    } else {
      setStaffMembers([]);
      setTotalCount(0);
      setListError(result.error);
      toast.error(result.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    void fetchStaff(1, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchStaff(currentPage, debouncedSearch);
  }, [currentPage]);

  useEffect(() => {
    setEditStaffPassword("");
    setEditStaffErrors({});
  }, [editingStaff]);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return staffMembers;

    return staffMembers.filter((member) => {
      const haystacks = [member.name, member.email, member.role]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(term));
    });
  }, [staffMembers, searchTerm]);

  const handleCreateStaff = () => {
    const validation = staffCreateSchema.safeParse(newStaff);

    if (!validation.success) {
      setNewStaffErrors(
        collectFieldErrors<StaffCreateValues>(validation.error.issues)
      );
      toast.error(
        validation.error.issues[0]?.message ??
          "Please correct the highlighted fields."
      );
      return;
    }

    setNewStaffErrors({});

    startTransition(async () => {
      const result = await createStaff(validation.data);

      if (result.success) {
        setStaffMembers((prev) => [result.data, ...prev]);
        setNewStaff(createEmptyStaff());
        setIsAddingStaff(false);
        toast.success("Staff member added successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleNewStaffChange = <Key extends keyof StaffCreateValues>(
    key: Key,
    value: StaffCreateValues[Key]
  ) => {
    setNewStaff((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key, setNewStaffErrors);
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;

    const validation = staffUpsertSchema.safeParse({
      ...editingStaff,
      password: editStaffPassword,
    });

    if (!validation.success) {
      setEditStaffErrors(
        collectFieldErrors<StaffUpsertValues>(validation.error.issues)
      );
      toast.error(
        validation.error.issues[0]?.message ??
          "Please correct the highlighted fields."
      );
      return;
    }

    setEditStaffErrors({});

    startTransition(async () => {
      const result = await updateStaff(validation.data);

      if (result.success) {
        setStaffMembers((prev) =>
          prev.map((member) =>
            member.id === result.data.id ? result.data : member
          )
        );
        setEditingStaff(null);
        toast.success("Staff member updated successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEditStaffChange = <Key extends keyof StaffUpsertValues>(
    key: Key,
    value: StaffUpsertValues[Key]
  ) => {
    setEditingStaff((prev) => (prev ? { ...prev, [key]: value } : prev));
    clearFieldError(key, setEditStaffErrors);
  };

  const handleDeleteStaff = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteStaff(deleteTarget.id);

      if (result.success) {
        setStaffMembers((prev) =>
          prev.filter((member) => member.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
        toast.success("Staff member removed successfully.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const rows = staffMembers.map((member) => (
    <TableRow key={member.id}>
      <TableCell className="font-medium">{member.name}</TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell className="capitalize">{member.role.toLowerCase()}</TableCell>
      <TableCell>
        <Badge
          variant={member.status === "ACTIVE" ? "default" : "secondary"}
          className={member.status === "ACTIVE" ? "bg-green-700" : ""}
        >
          {member.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="flex gap-4">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-4 text-xs font-medium hover:bg-zinc-800 hover:text-white"
          onClick={() => setEditingStaff(toStaffUpsertValues(member))}
          disabled={isPending}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 rounded-lg bg-[#b44b4b] px-4 text-xs font-medium text-white hover:bg-[#a34141] border-none shadow-none"
          onClick={() => setDeleteTarget(member)}
          disabled={isPending}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  ));

  if (isAddingStaff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center text-[#A41FC5]">
            <UserPlus className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold">Add Staff Member</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddingStaff(false)}
            className="rounded-lg bg-[#A41FC5] hover:bg-[#A41FC5]/90 px-4 text-xs font-medium text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff Management
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <UserAddForm
            values={newStaff}
            errors={newStaffErrors}
            fields={staffCreateFields}
            onChange={handleNewStaffChange}
            onClearError={(key) => clearFieldError(key, setNewStaffErrors)}
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddingStaff(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStaff}
              disabled={isPending}
              className="bg-[#A41FC5] hover:bg-[#A41FC5]/90 text-white"
            >
              {isPending ? "Creating..." : "Create Staff"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (editingStaff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center text-[#A41FC5]">
            <Edit className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold">Edit Staff Member</h2>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setEditingStaff(null)}
            className="rounded-lg bg-[#A41FC5] hover:bg-[#A41FC5]/90 px-4 text-xs font-medium text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff Management
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <UserEditForm
            values={editingStaff}
            errors={editStaffErrors}
            fields={staffEditFields}
            onChange={handleEditStaffChange}
            onClearError={(key) => clearFieldError(key, setEditStaffErrors)}
            passwordValue={editStaffPassword}
            passwordLabel="Reset Password"
            passwordDescription="Leave empty to keep the existing password."
            passwordError={editStaffErrors.password}
            onPasswordChange={(value) => {
              setEditStaffPassword(value);
              clearFieldError("password", setEditStaffErrors);
            }}
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditingStaff(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStaff}
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
        title="Staff Management"
        description="Manage staff roles, access levels, and account status."
        icon={Users}
        addLabel="Add Staff"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddingStaff(true)}
        isLoading={isPending}
      >
        <UserTable
          headers={["Name", "Email", "Role", "Status", "Actions"]}
          isLoading={isLoading}
          error={listError}
          emptyMessage="No staff members found."
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
        title="Delete Staff Member"
        description="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteStaff}
        isPending={isPending}
      />
    </>
  );
}
