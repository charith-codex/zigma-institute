"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";

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
    startTransition(async () => {
      const result = await createStaff(newStaff);
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
    startTransition(async () => {
      const result = await updateStaff({
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
      });
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
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="staff-phone">Phone</Label>
                  <Input
                    id="staff-phone"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="staff-status">Status</Label>
                  <Select
                    value={newStaff.status}
                    onValueChange={(v) =>
                      setNewStaff({
                        ...newStaff,
                        status: v as StaffDraft["status"],
                      })
                    }
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
                  <Label htmlFor="staff-role">Role</Label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(v) =>
                      setNewStaff({
                        ...newStaff,
                        role: v as StaffDraft["role"],
                      })
                    }
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
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, nic: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-address">Address</Label>
                <Input
                  id="staff-address"
                  value={newStaff.address}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, address: e.target.value })
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
        <Dialog open onOpenChange={() => setEditingStaff(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit staff member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editingStaff.name}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingStaff.phone ?? ""}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingStaff.status}
                    onValueChange={(v) =>
                      setEditingStaff({
                        ...editingStaff,
                        status: v as StaffRecord["status"],
                      })
                    }
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
