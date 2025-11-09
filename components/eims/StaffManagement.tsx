"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createStaff,
  deleteStaff,
  listStaff,
  updateStaff,
  type StaffRecord,
} from "@/lib/actions/eims-user-management";

const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

const roleOptions = [
  { label: "Administrator", value: "ADMIN" as const },
  { label: "Management", value: "MANAGER" as const },
  { label: "Attendance", value: "ATTENDANCE" as const },
];

type StaffDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  nic: string;
  role: "ADMIN" | "MANAGER" | "ATTENDANCE";
  status: "ACTIVE" | "INACTIVE";
};

const createEmptyStaff = (): StaffDraft => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  nic: "",
  role: "MANAGER",
  status: "ACTIVE",
});

export function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [newStaff, setNewStaff] = useState<StaffDraft>(createEmptyStaff);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    const fetchStaff = async () => {
      setIsLoading(true);
      const result = await listStaff();

      if (!isMounted) return;

      if (result.success) {
        setStaffMembers(result.data);
        setListError(null);
      } else {
        setStaffMembers([]);
        setListError(result.error);
        toast.error(result.error);
      }

      setIsLoading(false);
    };

    void fetchStaff();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staffMembers;

    return staffMembers.filter((member) =>
      [member.name, member.email, member.nic ?? ""]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [staffMembers, searchTerm]);

  const handleCreateStaff = () => {
    startTransition(async () => {
      const result = await createStaff({
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        address: newStaff.address,
        nic: newStaff.nic,
        role: newStaff.role,
        status: newStaff.status,
      });

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

  const handleUpdateStaff = () => {
    if (!editingStaff) return;

    startTransition(async () => {
      const result = await updateStaff({
        id: editingStaff.id,
        name: editingStaff.name,
        email: editingStaff.email,
        phone: editingStaff.phone ?? "",
        address: editingStaff.address ?? "",
        nic: editingStaff.nic ?? "",
        role: editingStaff.role,
        status: editingStaff.status,
        dob: editingStaff.dob ?? undefined,
        joinDate: editingStaff.joinDate ?? undefined,
      });

      if (result.success) {
        setStaffMembers((prev) =>
          prev.map((member) =>
            member.id === result.data.id ? result.data : member
          )
        );
        toast.success("Staff member updated successfully");
        setEditingStaff(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteStaff = (staffId: string) => {
    startTransition(async () => {
      const result = await deleteStaff(staffId);

      if (result.success) {
        setStaffMembers((prev) => prev.filter((member) => member.id !== staffId));
        toast.success("Staff member removed successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-sm text-muted-foreground">
        Loading staff...
      </div>
    );
  }

  if (listError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-muted-foreground">{listError}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setListError(null);
            setIsLoading(true);
            void listStaff().then((result) => {
              if (result.success) {
                setStaffMembers(result.data);
              } else {
                toast.error(result.error);
                setListError(result.error);
              }
              setIsLoading(false);
            });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  onChange={(event) =>
                    setNewStaff((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={newStaff.email}
                  onChange={(event) =>
                    setNewStaff((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="staff-phone">Phone</Label>
                  <Input
                    id="staff-phone"
                    value={newStaff.phone}
                    onChange={(event) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staff-status">Status</Label>
                  <Select
                    value={newStaff.status}
                    onValueChange={(value) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        status: value as StaffDraft["status"],
                      }))
                    }
                  >
                    <SelectTrigger id="staff-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="staff-role">Role</Label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(value) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        role: value as StaffDraft["role"],
                      }))
                    }
                  >
                    <SelectTrigger id="staff-role">
                      <SelectValue placeholder="Select role" />
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
                <div className="grid gap-2">
                  <Label htmlFor="staff-nic">NIC</Label>
                  <Input
                    id="staff-nic"
                    value={newStaff.nic}
                    onChange={(event) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        nic: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-address">Address</Label>
                <Input
                  id="staff-address"
                  value={newStaff.address}
                  onChange={(event) =>
                    setNewStaff((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
              <Button onClick={handleCreateStaff} disabled={isPending}>
                {isPending ? "Adding..." : "Add staff member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Staff overview</CardTitle>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, email, or NIC"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Badge variant="outline">Total: {filteredStaff.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{roleOptions.find((option) => option.value === member.role)?.label ?? member.role}</TableCell>
                  <TableCell>{member.nic ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
                      {member.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStaff(member)}
                        aria-label={`Edit ${member.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStaff(member.id)}
                        aria-label={`Delete ${member.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No staff members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingStaff && (
        <Dialog open onOpenChange={() => setEditingStaff(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit staff member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-name">Full name</Label>
                <Input
                  id="edit-staff-name"
                  value={editingStaff.name}
                  onChange={(event) =>
                    setEditingStaff((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: event.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-email">Email</Label>
                <Input
                  id="edit-staff-email"
                  type="email"
                  value={editingStaff.email}
                  onChange={(event) =>
                    setEditingStaff((prev) =>
                      prev
                        ? {
                            ...prev,
                            email: event.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-staff-phone">Phone</Label>
                  <Input
                    id="edit-staff-phone"
                    value={editingStaff.phone ?? ""}
                    onChange={(event) =>
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              phone: event.target.value,
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-staff-status">Status</Label>
                  <Select
                    value={editingStaff.status}
                    onValueChange={(value) =>
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: value as StaffRecord["status"],
                            }
                          : prev
                      )
                    }
                  >
                    <SelectTrigger id="edit-staff-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-staff-role">Role</Label>
                  <Select
                    value={editingStaff.role}
                    onValueChange={(value) =>
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              role: value as StaffRecord["role"],
                            }
                          : prev
                      )
                    }
                  >
                    <SelectTrigger id="edit-staff-role">
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
                <div className="grid gap-2">
                  <Label htmlFor="edit-staff-nic">NIC</Label>
                  <Input
                    id="edit-staff-nic"
                    value={editingStaff.nic ?? ""}
                    onChange={(event) =>
                      setEditingStaff((prev) =>
                        prev
                          ? {
                              ...prev,
                              nic: event.target.value,
                            }
                          : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staff-address">Address</Label>
                <Input
                  id="edit-staff-address"
                  value={editingStaff.address ?? ""}
                  onChange={(event) =>
                    setEditingStaff((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: event.target.value,
                          }
                        : prev
                    )
                  }
                />
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
