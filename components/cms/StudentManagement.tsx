import { useState } from "react";
import { useData } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface StudentManagementProps {
  classId?: string;
}

export function StudentManagement({ classId }: StudentManagementProps = {}) {
  const { profiles, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({
    email: "",
    full_name: "",
    phone: "",
    address: "",
    role: "student" as const,
  });

  const students =
    profiles?.filter((profile) => profile.role === "student") || [];

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async () => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Student added successfully");
      setIsAddDialogOpen(false);
      setNewStudent({
        email: "",
        full_name: "",
        phone: "",
        address: "",
        role: "student" as const,
      });
    } catch (error) {
      toast.error("Failed to add student");
      console.error(error);
    }
  };

  const handleUpdateStudent = async () => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Student updated successfully");
      setEditingStudent(null);
    } catch (error) {
      toast.error("Failed to update student");
      console.error(error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Student deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate student");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Student Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newStudent.full_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newStudent.address}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, address: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students Overview</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">Total: {filteredStudents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.full_name}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={student.is_active ? "default" : "secondary"}
                    >
                      {student.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStudent(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingStudent && (
        <Dialog
          open={!!editingStudent}
          onOpenChange={() => setEditingStudent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={editingStudent.full_name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      full_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={editingStudent.phone || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={editingStudent.address || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editingStudent.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditingStudent({
                      ...editingStudent,
                      is_active: value === "active",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateStudent} className="w-full">
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
