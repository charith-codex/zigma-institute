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
import { Plus, Search, Edit, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export function TeacherManagement() {
  const { profiles, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [newTeacher, setNewTeacher] = useState({
    email: "",
    full_name: "",
    phone: "",
    address: "",
    role: "teacher" as const,
  });

  const teachers =
    profiles?.filter((profile) => profile.role === "teacher") || [];

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = async () => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Teacher added successfully");
      setIsAddDialogOpen(false);
      setNewTeacher({
        email: "",
        full_name: "",
        phone: "",
        address: "",
        role: "teacher" as const,
      });
    } catch (error) {
      toast.error("Failed to add teacher");
      console.error(error);
    }
  };

  const handleUpdateTeacher = async () => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Teacher updated successfully");
      setEditingTeacher(null);
    } catch (error) {
      toast.error("Failed to update teacher");
      console.error(error);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Teacher deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate teacher");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading teachers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Teacher Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newTeacher.full_name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newTeacher.phone}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newTeacher.address}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, address: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddTeacher} className="w-full">
                Add Teacher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teachers Overview</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">Total: {filteredTeachers.length}</Badge>
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
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {teacher.full_name}
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={teacher.is_active ? "default" : "secondary"}
                    >
                      {teacher.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTeacher(teacher)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher.id)}
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

      {editingTeacher && (
        <Dialog
          open={!!editingTeacher}
          onOpenChange={() => setEditingTeacher(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={editingTeacher.full_name}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      full_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={editingTeacher.phone || ""}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={editingTeacher.address || ""}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editingTeacher.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditingTeacher({
                      ...editingTeacher,
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
              <Button onClick={handleUpdateTeacher} className="w-full">
                Update Teacher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
