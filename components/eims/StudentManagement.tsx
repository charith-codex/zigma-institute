"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { ProfileImageUploader } from "./ProfileImageUploader";

const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

const genderOptions = [
  { label: "Male", value: "MALE" as const },
  { label: "Female", value: "FEMALE" as const },
];

type StudentCreateErrorState = Partial<
  Record<keyof StudentCreateValues, string>
>;
type StudentEditErrorState = Partial<Record<keyof StudentUpsertValues, string>>;

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
  joinDate: "",
  gender: undefined,
  profileImage: "",
});

export function StudentManagement() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isListError, setIsListError] = useState<string | null>(null);
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

  const clearNewStudentError = (field: keyof StudentCreateValues) => {
    setNewStudentErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearEditStudentError = (field: keyof StudentUpsertValues) => {
    setEditStudentErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      setIsLoading(true);
      const result = await listStudents();

      if (!isMounted) return;

      if (result.success) {
        setStudents(result.data);
        setIsListError(null);
      } else {
        setStudents([]);
        setIsListError(result.error);
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
      const fieldErrors = collectFieldErrors(validation.error.issues);
      setNewStudentErrors(fieldErrors as StudentCreateErrorState);
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
        setIsAddDialogOpen(false);
        setNewStudent(createEmptyStudent());
        toast.success("Student added successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    const payload: StudentUpsertValues = {
      id: editingStudent.id,
      name: editingStudent.name,
      email: editingStudent.email,
      phone: editingStudent.phone ?? "",
      address: editingStudent.address ?? "",
      parentEmail: editingStudent.parentEmail ?? "",
      studentPublicId: editingStudent.studentPublicId ?? "",
      status: editingStudent.status,
      dob: editingStudent.dob ?? "",
      joinDate: editingStudent.joinDate ?? "",
      password: editStudentPassword,
      gender: editingStudent.gender ?? undefined,
      profileImage: editingStudent.profileImage ?? "",
    };

    const validation = studentUpsertSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors = collectFieldErrors(validation.error.issues);
      setEditStudentErrors(fieldErrors as StudentEditErrorState);
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
        toast.success("Student updated successfully");
        setEditingStudent(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    startTransition(async () => {
      const result = await deleteStudent(studentId);

      if (result.success) {
        setStudents((prev) =>
          prev.filter((student) => student.id !== studentId)
        );
        toast.success("Student removed successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-sm text-muted-foreground">
        Loading students...
      </div>
    );
  }

  if (isListError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-muted-foreground">{isListError}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsListError(null);
            setIsLoading(true);
            void listStudents().then((result) => {
              if (result.success) {
                setStudents(result.data);
              } else {
                toast.error(result.error);
                setIsListError(result.error);
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
          <h1 className="text-2xl font-bold">Student Management</h1>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setNewStudent(createEmptyStudent());
              setNewStudentErrors({});
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent size="wide" className="w-full">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto pr-2 -mr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">Full name</Label>
                  <Input
                    id="student-name"
                    value={newStudent.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        name: value,
                      }));
                      clearNewStudentError("name");
                    }}
                  />
                  {newStudentErrors.name && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={newStudent.email}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        email: value,
                      }));
                      clearNewStudentError("email");
                    }}
                  />
                  {newStudentErrors.email && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={newStudent.password}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        password: value,
                      }));
                      clearNewStudentError("password");
                    }}
                  />
                  {newStudentErrors.password && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.password}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-phone">Phone</Label>
                  <Input
                    id="student-phone"
                    value={newStudent.phone}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                      clearNewStudentError("phone");
                    }}
                  />
                  {newStudentErrors.phone && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.phone}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-dob">Date of birth</Label>
                  <Input
                    id="student-dob"
                    type="date"
                    value={newStudent.dob}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        dob: value,
                      }));
                      clearNewStudentError("dob");
                    }}
                  />
                  {newStudentErrors.dob && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.dob}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-join-date">Join date</Label>
                  <Input
                    id="student-join-date"
                    type="date"
                    value={newStudent.joinDate}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        joinDate: value,
                      }));
                      clearNewStudentError("joinDate");
                    }}
                  />
                  {newStudentErrors.joinDate && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.joinDate}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-parent-email">Parent email</Label>
                  <Input
                    id="student-parent-email"
                    type="email"
                    value={newStudent.parentEmail}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        parentEmail: value,
                      }));
                      clearNewStudentError("parentEmail");
                    }}
                  />
                  {newStudentErrors.parentEmail && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.parentEmail}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-public-id">Student ID</Label>
                  <Input
                    id="student-public-id"
                    value={newStudent.studentPublicId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        studentPublicId: value,
                      }));
                      clearNewStudentError("studentPublicId");
                    }}
                  />
                  {newStudentErrors.studentPublicId && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.studentPublicId}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="student-address">Address</Label>
                  <Input
                    id="student-address"
                    value={newStudent.address}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        address: value,
                      }));
                      clearNewStudentError("address");
                    }}
                  />
                  {newStudentErrors.address && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.address}
                    </p>
                  )}
                </div>

                <div className="flex gap-18">
                  <div className="grid gap-2">
                    <Label htmlFor="student-gender">Gender</Label>
                    <Select
                      value={newStudent.gender}
                      onValueChange={(value) => {
                        setNewStudent((prev) => ({
                          ...prev,
                          gender: value as StudentCreateValues["gender"],
                        }));
                        clearNewStudentError("gender");
                      }}
                    >
                      <SelectTrigger id="student-gender">
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
                    {newStudentErrors.gender && (
                      <p className="text-xs text-destructive">
                        {newStudentErrors.gender}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="student-status">Status</Label>
                    <Select
                      value={newStudent.status}
                      onValueChange={(value) => {
                        setNewStudent((prev) => ({
                          ...prev,
                          status: value as StudentCreateValues["status"],
                        }));
                        clearNewStudentError("status");
                      }}
                    >
                      <SelectTrigger id="student-status">
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
                    {newStudentErrors.status && (
                      <p className="text-xs text-destructive">
                        {newStudentErrors.status}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <ProfileImageUploader
                    value={newStudent.profileImage ?? ""}
                    onChange={(url) => {
                      setNewStudent((prev) => ({ ...prev, profileImage: url }));
                      clearNewStudentError("profileImage");
                    }}
                    disabled={isPending}
                  />
                  {newStudentErrors.profileImage && (
                    <p className="text-xs text-destructive">
                      {newStudentErrors.profileImage}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Button
                    onClick={handleCreateStudent}
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending ? "Adding..." : "Add student"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Students overview</CardTitle>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, email, or ID"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Badge variant="outline">Total: {filteredStudents.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Parent Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.studentPublicId ?? "—"}</TableCell>
                  <TableCell>{student.parentEmail ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {student.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStudent(student)}
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(student)}
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingStudent && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingStudent(null);
              setEditStudentErrors({});
              setEditStudentPassword("");
            }
          }}
        >
          <DialogContent size="wide" className="w-full">
            <DialogHeader>
              <DialogTitle>Edit student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-student-name">Full name</Label>
                <Input
                  id="edit-student-name"
                  value={editingStudent.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: value,
                          }
                        : prev
                    );
                    clearEditStudentError("name");
                  }}
                />
                {editStudentErrors.name && (
                  <p className="text-xs text-destructive">
                    {editStudentErrors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-email">Email</Label>
                <Input
                  id="edit-student-email"
                  type="email"
                  value={editingStudent.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            email: value,
                          }
                        : prev
                    );
                    clearEditStudentError("email");
                  }}
                />
                {editStudentErrors.email && (
                  <p className="text-xs text-destructive">
                    {editStudentErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-password">Password</Label>
                <Input
                  id="edit-student-password"
                  type="password"
                  value={editStudentPassword}
                  placeholder="Leave blank to keep current password"
                  onChange={(event) => {
                    setEditStudentPassword(event.target.value);
                    clearEditStudentError("password");
                  }}
                />
                {editStudentErrors.password && (
                  <p className="text-xs text-destructive">
                    {editStudentErrors.password}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-student-phone">Phone</Label>
                  <Input
                    id="edit-student-phone"
                    value={editingStudent.phone ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              phone: value,
                            }
                          : prev
                      );
                      clearEditStudentError("phone");
                    }}
                  />
                  {editStudentErrors.phone && (
                    <p className="text-xs text-destructive">
                      {editStudentErrors.phone}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-student-status">Status</Label>
                  <Select
                    value={editingStudent.status}
                    onValueChange={(value) => {
                      setEditingStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: value as StudentRecord["status"],
                            }
                          : prev
                      );
                      clearEditStudentError("status");
                    }}
                  >
                    <SelectTrigger id="edit-student-status">
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
                  {editStudentErrors.status && (
                    <p className="text-xs text-destructive">
                      {editStudentErrors.status}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-student-dob">Date of birth</Label>
                  <Input
                    id="edit-student-dob"
                    type="date"
                    value={formatDateForInput(editingStudent.dob)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              dob: value ? value : null,
                            }
                          : prev
                      );
                      clearEditStudentError("dob");
                    }}
                  />
                  {editStudentErrors.dob && (
                    <p className="text-xs text-destructive">
                      {editStudentErrors.dob}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-student-join-date">Join date</Label>
                  <Input
                    id="edit-student-join-date"
                    type="date"
                    value={formatDateForInput(editingStudent.joinDate)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEditingStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              joinDate: value ? value : null,
                            }
                          : prev
                      );
                      clearEditStudentError("joinDate");
                    }}
                  />
                  {editStudentErrors.joinDate && (
                    <p className="text-xs text-destructive">
                      {editStudentErrors.joinDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-student-gender">Gender</Label>
                  <Select
                    value={editingStudent.gender ?? undefined}
                    onValueChange={(value) => {
                      setEditingStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              gender: value as StudentRecord["gender"],
                            }
                          : prev
                      );
                      clearEditStudentError("gender");
                    }}
                  >
                    <SelectTrigger id="edit-student-gender">
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
                  {editStudentErrors.gender && (
                    <p className="text-xs text-destructive">
                      {editStudentErrors.gender}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-student-profile-image">
                    Profile image URL
                  </Label>
                  <ProfileImageUploader
                    value={editingStudent.profileImage ?? ""}
                    onChange={(url) => {
                      setEditingStudent((prev) =>
                        prev ? { ...prev, profileImage: url } : prev
                      );
                      clearEditStudentError("profileImage");
                    }}
                    disabled={isPending}
                  />
                  {editStudentErrors.profileImage && (
                    <p className="text-xs text-destructive">
                      {editStudentErrors.profileImage}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-parent-email">Parent email</Label>
                <Input
                  id="edit-student-parent-email"
                  type="email"
                  value={editingStudent.parentEmail ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            parentEmail: value,
                          }
                        : prev
                    );
                    clearEditStudentError("parentEmail");
                  }}
                />
                {editStudentErrors.parentEmail && (
                  <p className="text-xs text-destructive">
                    {editStudentErrors.parentEmail}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-id">Student ID</Label>
                <Input
                  id="edit-student-id"
                  value={editingStudent.studentPublicId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            studentPublicId: value,
                          }
                        : prev
                    );
                    clearEditStudentError("studentPublicId");
                  }}
                />
                {editStudentErrors.studentPublicId && (
                  <p className="text-xs text-destructive">
                    {editStudentErrors.studentPublicId}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-address">Address</Label>
                <Input
                  id="edit-student-address"
                  value={editingStudent.address ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: value,
                          }
                        : prev
                    );
                    clearEditStudentError("address");
                  }}
                />
                {editStudentErrors.address && (
                  <p className="text-xs text-destructive">
                    {editStudentErrors.address}
                  </p>
                )}
              </div>
              <Button onClick={handleUpdateStudent} disabled={isPending}>
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
            <DialogTitle>Delete student?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Are you sure you want to delete ${deleteTarget.name} (${deleteTarget.email})? This action cannot be undone.`
                : "Are you sure you want to delete this student? This action cannot be undone."}
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
                  handleDeleteStudent(id);
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
