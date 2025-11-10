"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

const roleOptions = [
  { label: "Administrator", value: "ADMIN" as const },
  { label: "Management", value: "MANAGER" as const },
  { label: "Attendance", value: "ATTENDANCE" as const },
];

const genderOptions = [
  { label: "Male", value: "MALE" as const },
  { label: "Female", value: "FEMALE" as const },
];

type StaffCreateErrorState = Partial<Record<keyof StaffCreateValues, string>>;
type StaffEditErrorState = Partial<Record<keyof StaffUpsertValues, string>>;

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
  joinDate: "",
  gender: undefined,
  profileImage: "",
});

export function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [newStaff, setNewStaff] =
    useState<StaffCreateValues>(createEmptyStaff);
  const [isPending, startTransition] = useTransition();
  const [editStaffPassword, setEditStaffPassword] = useState("");
  const [newStaffErrors, setNewStaffErrors] =
    useState<StaffCreateErrorState>({});
  const [editStaffErrors, setEditStaffErrors] =
    useState<StaffEditErrorState>({});

  const formatDateForInput = (value?: string | null) =>
    value ? value.slice(0, 10) : "";

  const collectFieldErrors = (issues: z.ZodIssue[]) => {
    const fieldErrors: Record<string, string> = {};
    for (const issue of issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return fieldErrors;
  };

  const clearNewStaffError = (field: keyof StaffCreateValues) => {
    setNewStaffErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearEditStaffError = (field: keyof StaffUpsertValues) => {
    setEditStaffErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Load staff from API
  useEffect(() => {
    let mounted = true;
    const fetchStaff = async () => {
      const result = await listStaff();
      if (!mounted) return;
      if (result.success) {
        setStaffMembers(result.data);
        setListError(null);
      } else {
        toast.error(result.error);
        setListError(result.error);
      }
      setIsLoading(false);
    };
    fetchStaff();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setEditStaffPassword("");
    setEditStaffErrors({});
  }, [editingStaff]);

  // Derived filtered staff
  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staffMembers;
    return staffMembers.filter((m) =>
      [m.name, m.email, m.nic ?? ""].some((v) =>
        v?.toLowerCase().includes(term)
      )
    );
  }, [staffMembers, searchTerm]);

  // Create staff
  const handleCreateStaff = () => {
    const validation = staffCreateSchema.safeParse(newStaff);

    if (!validation.success) {
      const fieldErrors = collectFieldErrors(validation.error.issues);
      setNewStaffErrors(fieldErrors as StaffCreateErrorState);
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
        setIsAddDialogOpen(false);
        setNewStaff(createEmptyStaff());
        toast.success("Staff member added successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  // Update staff
  const handleUpdateStaff = () => {
    if (!editingStaff) return;
    const payload: StaffUpsertValues = {
      id: editingStaff.id,
      name: editingStaff.name,
      email: editingStaff.email,
      role: editingStaff.role,
      status: editingStaff.status,
      phone: editingStaff.phone ?? "",
      address: editingStaff.address ?? "",
      nic: editingStaff.nic ?? "",
      dob: editingStaff.dob ?? "",
      joinDate: editingStaff.joinDate ?? "",
      password: editStaffPassword,
      gender: editingStaff.gender ?? undefined,
      profileImage: editingStaff.profileImage ?? "",
    };

    const validation = staffUpsertSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors = collectFieldErrors(validation.error.issues);
      setEditStaffErrors(fieldErrors as StaffEditErrorState);
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
          prev.map((s) => (s.id === result.data.id ? result.data : s))
        );
        setEditingStaff(null);
        toast.success("Staff member updated successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  // Delete staff
  const handleDeleteStaff = (id: string) => {
    startTransition(async () => {
      const result = await deleteStaff(id);
      if (result.success) {
        setStaffMembers((prev) => prev.filter((s) => s.id !== id));
        toast.success("Staff member removed successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  // UI Loading / Error states
  if (isLoading)
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        Loading staff...
      </div>
    );

  if (listError)
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-muted-foreground">{listError}</p>
        <Button onClick={() => location.reload()} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setNewStaff(createEmptyStaff());
              setNewStaffErrors({});
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-name">Full name</Label>
                <Input
                  id="staff-name"
                  value={newStaff.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewStaff((prev) => ({ ...prev, name: value }));
                    clearNewStaffError("name");
                  }}
                />
                {newStaffErrors.name && (
                  <p className="text-xs text-destructive">
                    {newStaffErrors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={newStaff.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewStaff((prev) => ({ ...prev, email: value }));
                    clearNewStaffError("email");
                  }}
                />
                {newStaffErrors.email && (
                  <p className="text-xs text-destructive">
                    {newStaffErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={newStaff.password}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewStaff((prev) => ({ ...prev, password: value }));
                    clearNewStaffError("password");
                  }}
                />
                {newStaffErrors.password && (
                  <p className="text-xs text-destructive">
                    {newStaffErrors.password}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="staff-phone">Phone</Label>
                  <Input
                    id="staff-phone"
                    value={newStaff.phone}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStaff((prev) => ({ ...prev, phone: value }));
                      clearNewStaffError("phone");
                    }}
                  />
                  {newStaffErrors.phone && (
                    <p className="text-xs text-destructive">
                      {newStaffErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="staff-status">Status</Label>
                  <Select
                    value={newStaff.status}
                    onValueChange={(value) => {
                      setNewStaff((prev) => ({
                        ...prev,
                        status: value as StaffCreateValues["status"],
                      }));
                      clearNewStaffError("status");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="staff-dob">Date of birth</Label>
                  <Input
                    id="staff-dob"
                    type="date"
                    value={newStaff.dob}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStaff((prev) => ({ ...prev, dob: value }));
                      clearNewStaffError("dob");
                    }}
                  />
                  {newStaffErrors.dob && (
                    <p className="text-xs text-destructive">
                      {newStaffErrors.dob}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="staff-join-date">Join date</Label>
                  <Input
                    id="staff-join-date"
                    type="date"
                    value={newStaff.joinDate}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStaff((prev) => ({ ...prev, joinDate: value }));
                      clearNewStaffError("joinDate");
                    }}
                  />
                  {newStaffErrors.joinDate && (
                    <p className="text-xs text-destructive">
                      {newStaffErrors.joinDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="staff-gender">Gender</Label>
                  <Select
                    value={newStaff.gender}
                    onValueChange={(value) => {
                      setNewStaff((prev) => ({
                        ...prev,
                        gender: value as StaffCreateValues["gender"],
                      }));
                      clearNewStaffError("gender");
                    }}
                  >
                    <SelectTrigger id="staff-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newStaffErrors.gender && (
                    <p className="text-xs text-destructive">
                      {newStaffErrors.gender}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="staff-profile-image">Profile image URL</Label>
                  <Input
                    id="staff-profile-image"
                    type="url"
                    value={newStaff.profileImage}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStaff((prev) => ({
                        ...prev,
                        profileImage: value,
                      }));
                      clearNewStaffError("profileImage");
                    }}
                  />
                  {newStaffErrors.profileImage && (
                    <p className="text-xs text-destructive">
                      {newStaffErrors.profileImage}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="staff-role">Role</Label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(value) => {
                      setNewStaff((prev) => ({
                        ...prev,
                        role: value as StaffCreateValues["role"],
                      }));
                      clearNewStaffError("role");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="staff-nic">NIC</Label>
                  <Input
                    id="staff-nic"
                    value={newStaff.nic}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStaff((prev) => ({ ...prev, nic: value }));
                      clearNewStaffError("nic");
                    }}
                  />
                  {newStaffErrors.nic && (
                    <p className="text-xs text-destructive">
                      {newStaffErrors.nic}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-address">Address</Label>
                <Input
                  id="staff-address"
                  value={newStaff.address}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewStaff((prev) => ({ ...prev, address: value }));
                    clearNewStaffError("address");
                  }}
                />
                {newStaffErrors.address && (
                  <p className="text-xs text-destructive">
                    {newStaffErrors.address}
                  </p>
                )}
              </div>
              <Button onClick={handleCreateStaff} disabled={isPending}>
                {isPending ? "Adding..." : "Add staff member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, email, or NIC"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline">Total: {filteredStaff.length}</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>NIC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {roleOptions.find((r) => r.value === member.role)?.label ??
                    member.role}
                </TableCell>
                <TableCell>{member.nic ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {member.status === "ACTIVE" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStaff(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredStaff.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingStaff && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingStaff(null);
              setEditStaffErrors({});
              setEditStaffPassword("");
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit staff member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editingStaff.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStaff((prev) =>
                      prev ? { ...prev, name: value } : prev
                    );
                    clearEditStaffError("name");
                  }}
                />
                {editStaffErrors.name && (
                  <p className="text-xs text-destructive">
                    {editStaffErrors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingStaff.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStaff((prev) =>
                      prev ? { ...prev, email: value } : prev
                    );
                    clearEditStaffError("email");
                  }}
                />
                {editStaffErrors.email && (
                  <p className="text-xs text-destructive">
                    {editStaffErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={editStaffPassword}
                  placeholder="Leave blank to keep current password"
                  onChange={(event) => {
                    setEditStaffPassword(event.target.value);
                    clearEditStaffError("password");
                  }}
                />
                {editStaffErrors.password && (
                  <p className="text-xs text-destructive">
                    {editStaffErrors.password}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingStaff.phone ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStaff((prev) =>
                        prev ? { ...prev, phone: value } : prev
                      );
                      clearEditStaffError("phone");
                    }}
                  />
                  {editStaffErrors.phone && (
                    <p className="text-xs text-destructive">
                      {editStaffErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingStaff.status}
                    onValueChange={(value) => {
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: value as StaffRecord["status"],
                            }
                          : prev
                      );
                      clearEditStaffError("status");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={editingStaff.role}
                    onValueChange={(value) => {
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              role: value as StaffRecord["role"],
                            }
                          : prev
                      );
                      clearEditStaffError("role");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>NIC</Label>
                  <Input
                    value={editingStaff.nic ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStaff((prev) =>
                        prev ? { ...prev, nic: value } : prev
                      );
                      clearEditStaffError("nic");
                    }}
                  />
                  {editStaffErrors.nic && (
                    <p className="text-xs text-destructive">
                      {editStaffErrors.nic}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  value={editingStaff.address ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStaff((prev) =>
                      prev ? { ...prev, address: value } : prev
                    );
                    clearEditStaffError("address");
                  }}
                />
                {editStaffErrors.address && (
                  <p className="text-xs text-destructive">
                    {editStaffErrors.address}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Date of birth</Label>
                  <Input
                    type="date"
                    value={formatDateForInput(editingStaff.dob)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStaff((prev) =>
                        prev
                          ? { ...prev, dob: value ? value : null }
                          : prev
                      );
                      clearEditStaffError("dob");
                    }}
                  />
                  {editStaffErrors.dob && (
                    <p className="text-xs text-destructive">
                      {editStaffErrors.dob}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Join date</Label>
                  <Input
                    type="date"
                    value={formatDateForInput(editingStaff.joinDate)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStaff((prev) =>
                        prev
                          ? { ...prev, joinDate: value ? value : null }
                          : prev
                      );
                      clearEditStaffError("joinDate");
                    }}
                  />
                  {editStaffErrors.joinDate && (
                    <p className="text-xs text-destructive">
                      {editStaffErrors.joinDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={editingStaff.gender ?? undefined}
                    onValueChange={(value) => {
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              gender: value as StaffRecord["gender"],
                            }
                          : prev
                      );
                      clearEditStaffError("gender");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editStaffErrors.gender && (
                    <p className="text-xs text-destructive">
                      {editStaffErrors.gender}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Profile image URL</Label>
                  <Input
                    type="url"
                    value={editingStaff.profileImage ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStaff((prev) =>
                        prev
                          ? { ...prev, profileImage: value }
                          : prev
                      );
                      clearEditStaffError("profileImage");
                    }}
                  />
                  {editStaffErrors.profileImage && (
                    <p className="text-xs text-destructive">
                      {editStaffErrors.profileImage}
                    </p>
                  )}
                </div>
              </div>
              <Button onClick={handleUpdateStaff} disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
