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
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
  type StudentRecord,
} from "@/lib/actions/eims-user-management";

const statusOptions = [
  { label: "Active", value: "ACTIVE" as const },
  { label: "Inactive", value: "INACTIVE" as const },
];

type StudentDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  parentEmail: string;
  studentPublicId: string;
  status: "ACTIVE" | "INACTIVE";
};

const createEmptyStudent = (): StudentDraft => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  parentEmail: "",
  studentPublicId: "",
  status: "ACTIVE",
});

export function StudentManagement() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isListError, setIsListError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [newStudent, setNewStudent] = useState<StudentDraft>(createEmptyStudent);
  const [isPending, startTransition] = useTransition();

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
    startTransition(async () => {
      const result = await createStudent({
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        address: newStudent.address,
        parentEmail: newStudent.parentEmail,
        studentPublicId: newStudent.studentPublicId,
        status: newStudent.status,
      });

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

    startTransition(async () => {
      const result = await updateStudent({
        id: editingStudent.id,
        name: editingStudent.name,
        email: editingStudent.email,
        phone: editingStudent.phone ?? "",
        address: editingStudent.address ?? "",
        parentEmail: editingStudent.parentEmail ?? "",
        studentPublicId: editingStudent.studentPublicId ?? "",
        status: editingStudent.status,
        dob: editingStudent.dob ?? undefined,
        joinDate: editingStudent.joinDate ?? undefined,
      });

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
        setStudents((prev) => prev.filter((student) => student.id !== studentId));
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="student-name">Full name</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(event) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={newStudent.email}
                  onChange={(event) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="student-phone">Phone</Label>
                  <Input
                    id="student-phone"
                    value={newStudent.phone}
                    onChange={(event) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-status">Status</Label>
                  <Select
                    value={newStudent.status}
                    onValueChange={(value) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        status: value as StudentDraft["status"],
                      }))
                    }
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
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-parent-email">Parent email</Label>
                <Input
                  id="student-parent-email"
                  type="email"
                  value={newStudent.parentEmail}
                  onChange={(event) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      parentEmail: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-public-id">Student ID</Label>
                <Input
                  id="student-public-id"
                  value={newStudent.studentPublicId}
                  onChange={(event) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      studentPublicId: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-address">Address</Label>
                <Input
                  id="student-address"
                  value={newStudent.address}
                  onChange={(event) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                />
              </div>
              <Button onClick={handleCreateStudent} disabled={isPending}>
                {isPending ? "Adding..." : "Add student"}
              </Button>
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
                    <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
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
                        onClick={() => handleDeleteStudent(student.id)}
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
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingStudent && (
        <Dialog open onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-student-name">Full name</Label>
                <Input
                  id="edit-student-name"
                  value={editingStudent.name}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
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
                <Label htmlFor="edit-student-email">Email</Label>
                <Input
                  id="edit-student-email"
                  type="email"
                  value={editingStudent.email}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
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
                  <Label htmlFor="edit-student-phone">Phone</Label>
                  <Input
                    id="edit-student-phone"
                    value={editingStudent.phone ?? ""}
                    onChange={(event) =>
                      setEditingStudent((prev) =>
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
                  <Label htmlFor="edit-student-status">Status</Label>
                  <Select
                    value={editingStudent.status}
                    onValueChange={(value) =>
                      setEditingStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: value as StudentRecord["status"],
                            }
                          : prev
                      )
                    }
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
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-parent-email">Parent email</Label>
                <Input
                  id="edit-student-parent-email"
                  type="email"
                  value={editingStudent.parentEmail ?? ""}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            parentEmail: event.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-id">Student ID</Label>
                <Input
                  id="edit-student-id"
                  value={editingStudent.studentPublicId ?? ""}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            studentPublicId: event.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-student-address">Address</Label>
                <Input
                  id="edit-student-address"
                  value={editingStudent.address ?? ""}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
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
              <Button onClick={handleUpdateStudent} disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
