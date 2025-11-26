"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { GraduationCap, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileImageUploader } from "./ProfileImageUploader";
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
import {
  teacherCreateSchema,
  teacherUpsertSchema,
  type TeacherCreateValues,
  type TeacherUpsertValues,
} from "@/lib/validators/eims-user-management";

const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

const genderOptions = [
  { label: "Male", value: "MALE" as const },
  { label: "Female", value: "FEMALE" as const },
];

type TeacherCreateErrorState = Partial<
  Record<keyof TeacherCreateValues, string>
>;
type TeacherEditErrorState = Partial<Record<keyof TeacherUpsertValues, string>>;

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
  joinDate: "",
  gender: undefined,
  profileImage: "",
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
  const [deleteTarget, setDeleteTarget] = useState<TeacherRecord | null>(null);
  const [newTeacher, setNewTeacher] =
    useState<TeacherCreateValues>(createEmptyTeacher);
  const [isPending, startTransition] = useTransition();
  const [editTeacherPassword, setEditTeacherPassword] = useState("");
  const [newTeacherErrors, setNewTeacherErrors] =
    useState<TeacherCreateErrorState>({});
  const [editTeacherErrors, setEditTeacherErrors] =
    useState<TeacherEditErrorState>({});

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

  const clearNewTeacherError = (field: keyof TeacherCreateValues) => {
    setNewTeacherErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearEditTeacherError = (field: keyof TeacherUpsertValues) => {
    setEditTeacherErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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

  useEffect(() => {
    setEditTeacherPassword("");
    setEditTeacherErrors({});
  }, [editingTeacher]);

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
    const validation = teacherCreateSchema.safeParse(newTeacher);

    if (!validation.success) {
      const fieldErrors = collectFieldErrors(validation.error.issues);
      setNewTeacherErrors(fieldErrors as TeacherCreateErrorState);
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

    const payload: TeacherUpsertValues = {
      id: editingTeacher.id,
      name: editingTeacher.name,
      email: editingTeacher.email,
      phone: editingTeacher.phone ?? "",
      address: editingTeacher.address ?? "",
      qualification: editingTeacher.qualification ?? "",
      nic: editingTeacher.nic ?? "",
      status: editingTeacher.status,
      dob: editingTeacher.dob ?? "",
      joinDate: editingTeacher.joinDate ?? "",
      password: editTeacherPassword,
      gender: editingTeacher.gender ?? undefined,
      profileImage: editingTeacher.profileImage ?? "",
    };

    const validation = teacherUpsertSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors = collectFieldErrors(validation.error.issues);
      setEditTeacherErrors(fieldErrors as TeacherEditErrorState);
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
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setNewTeacher(createEmptyTeacher());
              setNewTeacherErrors({});
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent size="wide" className="w-full">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="teacher-name">Full name</Label>
                <Input
                  id="teacher-name"
                  value={newTeacher.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewTeacher((prev) => ({ ...prev, name: value }));
                    clearNewTeacherError("name");
                  }}
                />
                {newTeacherErrors.name && (
                  <p className="text-xs text-destructive">
                    {newTeacherErrors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewTeacher((prev) => ({
                      ...prev,
                      email: value,
                    }));
                    clearNewTeacherError("email");
                  }}
                />
                {newTeacherErrors.email && (
                  <p className="text-xs text-destructive">
                    {newTeacherErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-password">Password</Label>
                <Input
                  id="teacher-password"
                  type="password"
                  value={newTeacher.password}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewTeacher((prev) => ({
                      ...prev,
                      password: value,
                    }));
                    clearNewTeacherError("password");
                  }}
                />
                {newTeacherErrors.password && (
                  <p className="text-xs text-destructive">
                    {newTeacherErrors.password}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="teacher-phone">Phone</Label>
                  <Input
                    id="teacher-phone"
                    value={newTeacher.phone}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewTeacher((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                      clearNewTeacherError("phone");
                    }}
                  />
                  {newTeacherErrors.phone && (
                    <p className="text-xs text-destructive">
                      {newTeacherErrors.phone}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher-status">Status</Label>
                  <Select
                    value={newTeacher.status}
                    onValueChange={(value) => {
                      setNewTeacher((prev) => ({
                        ...prev,
                        status: value as TeacherCreateValues["status"],
                      }));
                      clearNewTeacherError("status");
                    }}
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
                  {newTeacherErrors.status && (
                    <p className="text-xs text-destructive">
                      {newTeacherErrors.status}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="teacher-dob">Date of birth</Label>
                  <Input
                    id="teacher-dob"
                    type="date"
                    value={newTeacher.dob}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewTeacher((prev) => ({
                        ...prev,
                        dob: value,
                      }));
                      clearNewTeacherError("dob");
                    }}
                  />
                  {newTeacherErrors.dob && (
                    <p className="text-xs text-destructive">
                      {newTeacherErrors.dob}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher-join-date">Join date</Label>
                  <Input
                    id="teacher-join-date"
                    type="date"
                    value={newTeacher.joinDate}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewTeacher((prev) => ({
                        ...prev,
                        joinDate: value,
                      }));
                      clearNewTeacherError("joinDate");
                    }}
                  />
                  {newTeacherErrors.joinDate && (
                    <p className="text-xs text-destructive">
                      {newTeacherErrors.joinDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="teacher-gender">Gender</Label>
                  <Select
                    value={newTeacher.gender}
                    onValueChange={(value) => {
                      setNewTeacher((prev) => ({
                        ...prev,
                        gender: value as TeacherCreateValues["gender"],
                      }));
                      clearNewTeacherError("gender");
                    }}
                  >
                    <SelectTrigger id="teacher-gender">
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
                  {newTeacherErrors.gender && (
                    <p className="text-xs text-destructive">
                      {newTeacherErrors.gender}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <ProfileImageUploader
                    value={newTeacher.profileImage ?? ""}
                    onChange={(url) => {
                      setNewTeacher((prev) => ({ ...prev, profileImage: url }));
                      clearNewTeacherError("profileImage");
                    }}
                    disabled={isPending}
                  />
                  {newTeacherErrors.profileImage && (
                    <p className="text-xs text-destructive">
                      {newTeacherErrors.profileImage}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-qualification">Qualification</Label>
                <Input
                  id="teacher-qualification"
                  value={newTeacher.qualification}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewTeacher((prev) => ({
                      ...prev,
                      qualification: value,
                    }));
                    clearNewTeacherError("qualification");
                  }}
                />
                {newTeacherErrors.qualification && (
                  <p className="text-xs text-destructive">
                    {newTeacherErrors.qualification}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-nic">NIC</Label>
                <Input
                  id="teacher-nic"
                  value={newTeacher.nic}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewTeacher((prev) => ({ ...prev, nic: value }));
                    clearNewTeacherError("nic");
                  }}
                />
                {newTeacherErrors.nic && (
                  <p className="text-xs text-destructive">
                    {newTeacherErrors.nic}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher-address">Address</Label>
                <Input
                  id="teacher-address"
                  value={newTeacher.address}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewTeacher((prev) => ({
                      ...prev,
                      address: value,
                    }));
                    clearNewTeacherError("address");
                  }}
                />
                {newTeacherErrors.address && (
                  <p className="text-xs text-destructive">
                    {newTeacherErrors.address}
                  </p>
                )}
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
                        onClick={() => setDeleteTarget(teacher)}
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
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingTeacher(null);
              setEditTeacherErrors({});
              setEditTeacherPassword("");
            }
          }}
        >
          <DialogContent size="wide" className="w-full">
            <DialogHeader>
              <DialogTitle>Edit teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-name">Full name</Label>
                <Input
                  id="edit-teacher-name"
                  value={editingTeacher.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, name: value } : prev
                    );
                    clearEditTeacherError("name");
                  }}
                />
                {editTeacherErrors.name && (
                  <p className="text-xs text-destructive">
                    {editTeacherErrors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-email">Email</Label>
                <Input
                  id="edit-teacher-email"
                  type="email"
                  value={editingTeacher.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, email: value } : prev
                    );
                    clearEditTeacherError("email");
                  }}
                />
                {editTeacherErrors.email && (
                  <p className="text-xs text-destructive">
                    {editTeacherErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-password">Password</Label>
                <Input
                  id="edit-teacher-password"
                  type="password"
                  value={editTeacherPassword}
                  placeholder="Leave blank to keep current password"
                  onChange={(event) => {
                    setEditTeacherPassword(event.target.value);
                    clearEditTeacherError("password");
                  }}
                />
                {editTeacherErrors.password && (
                  <p className="text-xs text-destructive">
                    {editTeacherErrors.password}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-phone">Phone</Label>
                  <Input
                    id="edit-teacher-phone"
                    value={editingTeacher.phone ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingTeacher((prev) =>
                        prev ? { ...prev, phone: value } : prev
                      );
                      clearEditTeacherError("phone");
                    }}
                  />
                  {editTeacherErrors.phone && (
                    <p className="text-xs text-destructive">
                      {editTeacherErrors.phone}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-status">Status</Label>
                  <Select
                    value={editingTeacher.status}
                    onValueChange={(value) => {
                      setEditingTeacher((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: value as TeacherRecord["status"],
                            }
                          : prev
                      );
                      clearEditTeacherError("status");
                    }}
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
                  {editTeacherErrors.status && (
                    <p className="text-xs text-destructive">
                      {editTeacherErrors.status}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-dob">Date of birth</Label>
                  <Input
                    id="edit-teacher-dob"
                    type="date"
                    value={formatDateForInput(editingTeacher.dob)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingTeacher((prev) =>
                        prev ? { ...prev, dob: value ? value : null } : prev
                      );
                      clearEditTeacherError("dob");
                    }}
                  />
                  {editTeacherErrors.dob && (
                    <p className="text-xs text-destructive">
                      {editTeacherErrors.dob}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-join-date">Join date</Label>
                  <Input
                    id="edit-teacher-join-date"
                    type="date"
                    value={formatDateForInput(editingTeacher.joinDate)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingTeacher((prev) =>
                        prev
                          ? {
                              ...prev,
                              joinDate: value ? value : null,
                            }
                          : prev
                      );
                      clearEditTeacherError("joinDate");
                    }}
                  />
                  {editTeacherErrors.joinDate && (
                    <p className="text-xs text-destructive">
                      {editTeacherErrors.joinDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-teacher-gender">Gender</Label>
                  <Select
                    value={editingTeacher.gender ?? undefined}
                    onValueChange={(value) => {
                      setEditingTeacher((prev) =>
                        prev
                          ? {
                              ...prev,
                              gender: value as TeacherRecord["gender"],
                            }
                          : prev
                      );
                      clearEditTeacherError("gender");
                    }}
                  >
                    <SelectTrigger id="edit-teacher-gender">
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
                  {editTeacherErrors.gender && (
                    <p className="text-xs text-destructive">
                      {editTeacherErrors.gender}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <ProfileImageUploader
                    value={editingTeacher.profileImage ?? ""}
                    onChange={(url) => {
                      setEditingTeacher((prev) =>
                        prev ? { ...prev, profileImage: url } : prev
                      );
                      clearEditTeacherError("profileImage");
                    }}
                    disabled={isPending}
                  />
                  {editTeacherErrors.profileImage && (
                    <p className="text-xs text-destructive">
                      {editTeacherErrors.profileImage}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-qualification">
                  Qualification
                </Label>
                <Input
                  id="edit-teacher-qualification"
                  value={editingTeacher.qualification ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingTeacher((prev) =>
                      prev
                        ? {
                            ...prev,
                            qualification: value,
                          }
                        : prev
                    );
                    clearEditTeacherError("qualification");
                  }}
                />
                {editTeacherErrors.qualification && (
                  <p className="text-xs text-destructive">
                    {editTeacherErrors.qualification}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-nic">NIC</Label>
                <Input
                  id="edit-teacher-nic"
                  value={editingTeacher.nic ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, nic: value } : prev
                    );
                    clearEditTeacherError("nic");
                  }}
                />
                {editTeacherErrors.nic && (
                  <p className="text-xs text-destructive">
                    {editTeacherErrors.nic}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-teacher-address">Address</Label>
                <Input
                  id="edit-teacher-address"
                  value={editingTeacher.address ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingTeacher((prev) =>
                      prev ? { ...prev, address: value } : prev
                    );
                    clearEditTeacherError("address");
                  }}
                />
                {editTeacherErrors.address && (
                  <p className="text-xs text-destructive">
                    {editTeacherErrors.address}
                  </p>
                )}
              </div>
              <Button onClick={handleUpdateTeacher} disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete teacher?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Are you sure you want to delete ${deleteTarget.name} (${deleteTarget.email})? This action cannot be undone.`
                : "Are you sure you want to delete this teacher? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              No, keep
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  const id = deleteTarget.id;
                  setDeleteTarget(null);
                  handleDeleteTeacher(id);
                }
              }}
              disabled={isPending}
            >
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
