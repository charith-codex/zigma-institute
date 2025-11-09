"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { GraduationCap, Plus, Search, Edit, Trash2 } from "lucide-react";
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
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher,
  type TeacherRecord,
} from "@/lib/actions/eims-user-management";

const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

type TeacherDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  nic: string;
  status: "ACTIVE" | "INACTIVE";
};

const createEmptyTeacher = (): TeacherDraft => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  qualification: "",
  nic: "",
  status: "ACTIVE",
});

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(
    null
  );
  const [newTeacher, setNewTeacher] =
    useState<TeacherDraft>(createEmptyTeacher);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    const fetchTeachers = async () => {
      setIsLoading(true);
      const result = await listTeachers();

      if (!isMounted) return;

      if (result.success) {
        setTeachers(result.data);
        setListError(null);
      } else {
        setTeachers([]);
        setListError(result.error);
        toast.error(result.error);
      }

      setIsLoading(false);
    };

    void fetchTeachers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;

    return teachers.filter((teacher) =>
      [teacher.name, teacher.email, teacher.nic ?? ""]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [teachers, searchTerm]);

  const handleCreateTeacher = () => {
    startTransition(async () => {
      const result = await createTeacher({
        name: newTeacher.name,
        email: newTeacher.email,
        phone: newTeacher.phone,
        address: newTeacher.address,
        qualification: newTeacher.qualification,
        nic: newTeacher.nic,
        status: newTeacher.status,
      });

      if (result.success) {
        setTeachers((prev) => [result.data, ...prev]);
        setIsAddDialogOpen(false);
        setNewTeacher(createEmptyTeacher());
        toast.success("Teacher added successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleUpdateTeacher = () => {
    if (!editingTeacher) return;

    startTransition(async () => {
      const result = await updateTeacher({
        id: editingTeacher.id,
        name: editingTeacher.name,
        email: editingTeacher.email,
        phone: editingTeacher.phone ?? "",
        address: editingTeacher.address ?? "",
        qualification: editingTeacher.qualification ?? "",
        nic: editingTeacher.nic ?? "",
        status: editingTeacher.status,
        dob: editingTeacher.dob ?? undefined,
        joinDate: editingTeacher.joinDate ?? undefined,
      });

      if (result.success) {
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.id === result.data.id ? result.data : teacher
          )
        );
        toast.success("Teacher updated successfully");
        setEditingTeacher(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteTeacher = (teacherId: string) => {
    startTransition(async () => {
      const result = await deleteTeacher(teacherId);

      if (result.success) {
        setTeachers((prev) =>
          prev.filter((teacher) => teacher.id !== teacherId)
        );
        toast.success("Teacher removed successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-sm text-muted-foreground">
        Loading teachers...
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
            void listTeachers().then((result) => {
              if (result.success) {
                setTeachers(result.data);
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
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Teacher Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="teacher-name">Full name</Label>
                <Input
                  id="teacher-name"
                  value={newTeacher.name}
                  onChange={(e) =>
                    setNewTeacher((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) =>
                    setNewTeacher((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="teacher-phone">Phone</Label>
                  <Input
                    id="teacher-phone"
                    value={newTeacher.phone}
                    onChange={(e) =>
                      setNewTeacher((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher-status">Status</Label>
                  <Select
                    value={newTeacher.status}
                    onValueChange={(value) =>
                      setNewTeacher((prev) => ({
                        ...prev,
                        status: value as TeacherDraft["status"],
                      }))
                    }
                  >
                    <SelectTrigger id="teacher-status">
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
              <div className="grid gap-2">
                <Label htmlFor="teacher-qualification">Qualification</Label>
                <Input
                  id="teacher-qualification"
                  value={newTeacher.qualification}
                  onChange={(e) =>
                    setNewTeacher((prev) => ({
                      ...prev,
                      qualification: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-nic">NIC</Label>
                <Input
                  id="teacher-nic"
                  value={newTeacher.nic}
                  onChange={(e) =>
                    setNewTeacher((prev) => ({ ...prev, nic: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-address">Address</Label>
                <Input
                  id="teacher-address"
                  value={newTeacher.address}
                  onChange={(e) =>
                    setNewTeacher((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
              <Button onClick={handleCreateTeacher} disabled={isPending}>
                {isPending ? "Adding..." : "Add teacher"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Teachers overview</CardTitle>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, email, or NIC"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="outline">Total: {filteredTeachers.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.qualification ?? "—"}</TableCell>
                  <TableCell>{teacher.nic ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        teacher.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {teacher.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTeacher(teacher)}
                        aria-label={`Edit ${teacher.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        aria-label={`Delete ${teacher.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTeachers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No teachers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingTeacher && (
        <Dialog open onOpenChange={() => setEditingTeacher(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-name">Full name</Label>
                <Input
                  id="edit-teacher-name"
                  value={editingTeacher.name}
                  onChange={(e) =>
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-email">Email</Label>
                <Input
                  id="edit-teacher-email"
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) =>
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-phone">Phone</Label>
                  <Input
                    id="edit-teacher-phone"
                    value={editingTeacher.phone ?? ""}
                    onChange={(e) =>
                      setEditingTeacher((prev) =>
                        prev ? { ...prev, phone: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-status">Status</Label>
                  <Select
                    value={editingTeacher.status}
                    onValueChange={(value) =>
                      setEditingTeacher((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: value as TeacherRecord["status"],
                            }
                          : prev
                      )
                    }
                  >
                    <SelectTrigger id="edit-teacher-status">
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
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-qualification">
                  Qualification
                </Label>
                <Input
                  id="edit-teacher-qualification"
                  value={editingTeacher.qualification ?? ""}
                  onChange={(e) =>
                    setEditingTeacher((prev) =>
                      prev
                        ? {
                            ...prev,
                            qualification: e.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-nic">NIC</Label>
                <Input
                  id="edit-teacher-nic"
                  value={editingTeacher.nic ?? ""}
                  onChange={(e) =>
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, nic: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-address">Address</Label>
                <Input
                  id="edit-teacher-address"
                  value={editingTeacher.address ?? ""}
                  onChange={(e) =>
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, address: e.target.value } : prev
                    )
                  }
                />
              </div>
              <Button onClick={handleUpdateTeacher} disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
