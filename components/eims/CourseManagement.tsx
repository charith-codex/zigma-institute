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
import { Plus, Search, Edit, Trash2, Calendar, Users } from "lucide-react";
// TODO: Replace with Neon PostgreSQL client
import { toast } from "sonner";

export function CourseManagement() {
  const { classes, profiles, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingClass, setEditingClass] = useState<any>(null);
  const [newClass, setNewClass] = useState({
    name: "",
    subject: "",
    category: "OL",
    teacher_id: "",
    max_students: 30,
    academic_year: new Date().getFullYear().toString(),
    semester: "1",
    room_number: "",
    schedule_days: [] as string[],
    schedule_time: "",
  });

  const teachers =
    profiles?.filter((profile) => profile.role === "teacher") || [];

  const filteredClasses =
    classes?.filter(
      (cls) =>
        cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.full_name || "Unassigned";
  };

  const handleAddClass = async () => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Course added successfully");
      setIsAddDialogOpen(false);
      setNewClass({
        name: "",
        subject: "",
        category: "OL",
        teacher_id: "",
        max_students: 30,
        academic_year: new Date().getFullYear().toString(),
        semester: "1",
        room_number: "",
        schedule_days: [],
        schedule_time: "",
      });
    } catch (error) {
      toast.error("Failed to add class");
      console.error(error);
    }
  };

  const handleUpdateClass = async () => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Course updated successfully");
      setEditingClass(null);
    } catch (error) {
      toast.error("Failed to update class");
      console.error(error);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast.success("Course deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate class");
      console.error(error);
    }
  };

  const categoryOptions = [
    { value: "OL", label: "O Level" },
    { value: "AL", label: "A Level" },
    { value: "Professional", label: "Professional (AAT, CA, etc.)" },
  ];

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading classes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newClass.subject}
                  onChange={(e) =>
                    setNewClass({ ...newClass, subject: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newClass.category}
                  onValueChange={(value) =>
                    setNewClass({ ...newClass, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teacher">Teacher</Label>
                <Select
                  value={newClass.teacher_id}
                  onValueChange={(value) =>
                    setNewClass({ ...newClass, teacher_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max_students">Max Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={newClass.max_students}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      max_students: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={newClass.room_number}
                  onChange={(e) =>
                    setNewClass({ ...newClass, room_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  value={newClass.academic_year}
                  onChange={(e) =>
                    setNewClass({ ...newClass, academic_year: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={newClass.semester}
                  onValueChange={(value) =>
                    setNewClass({ ...newClass, semester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button onClick={handleAddClass} className="w-full">
                  Add Course
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {categoryOptions.map((category) => {
          const count = filteredClasses.filter(
            (cls) => cls.category === category.value
          ).length;
          return (
            <Card key={category.value}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-muted-foreground">classes</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses Overview</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">Total: {filteredClasses.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {
                        categoryOptions.find(
                          (cat) => cat.value === cls.category
                        )?.label
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>{getTeacherName(cls.teacher_id)}</TableCell>
                  <TableCell>0/{cls.max_students}</TableCell>
                  <TableCell>
                    <Badge variant={cls.is_active ? "default" : "secondary"}>
                      {cls.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingClass(cls)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(cls.id)}
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

      {editingClass && (
        <Dialog
          open={!!editingClass}
          onOpenChange={() => setEditingClass(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Course Name</Label>
                <Input
                  id="edit_name"
                  value={editingClass.name}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_subject">Subject</Label>
                <Input
                  id="edit_subject"
                  value={editingClass.subject}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      subject: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_category">Category</Label>
                <Select
                  value={editingClass.category}
                  onValueChange={(value) =>
                    setEditingClass({ ...editingClass, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_teacher">Teacher</Label>
                <Select
                  value={editingClass.teacher_id}
                  onValueChange={(value) =>
                    setEditingClass({ ...editingClass, teacher_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editingClass.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditingClass({
                      ...editingClass,
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
              <div className="col-span-2">
                <Button onClick={handleUpdateClass} className="w-full">
                  Update Course
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
