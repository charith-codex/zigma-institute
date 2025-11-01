import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "management_staff" | "attendance_staff" | "it_admin" | "teacher";
  department: string;
  status: "active" | "inactive";
  joinDate: string;
  address?: string;
  notes?: string;
}

const mockStaff: StaffMember[] = [
  {
    id: "STAFF-001",
    fullName: "John Administrator",
    email: "john.admin@zigma.edu",
    phone: "+1-555-0201",
    role: "it_admin",
    department: "Information Technology",
    status: "active",
    joinDate: "2023-01-15",
    address: "123 Admin St, Springfield, IL",
    notes: "Senior IT Administrator with full system access",
  },
  {
    id: "STAFF-002",
    fullName: "Sarah Manager",
    email: "sarah.manager@zigma.edu",
    phone: "+1-555-0202",
    role: "management_staff",
    department: "Academic Affairs",
    status: "active",
    joinDate: "2023-03-20",
    address: "456 Manager Ave, Springfield, IL",
    notes: "Handles student affairs and administrative tasks",
  },
  {
    id: "STAFF-003",
    fullName: "Mike Attendance",
    email: "mike.attendance@zigma.edu",
    phone: "+1-555-0203",
    role: "attendance_staff",
    department: "Student Services",
    status: "active",
    joinDate: "2023-06-10",
    address: "789 Service Rd, Springfield, IL",
    notes: "Responsible for attendance tracking and student monitoring",
  },
  {
    id: "STAFF-004",
    fullName: "Lisa Teacher",
    email: "lisa.teacher@zigma.edu",
    phone: "+1-555-0204",
    role: "teacher",
    department: "Mathematics",
    status: "inactive",
    joinDate: "2022-09-05",
    address: "321 Teacher Ln, Springfield, IL",
    notes: "On temporary leave",
  },
];

const roleLabels = {
  management_staff: "Management Staff",
  attendance_staff: "Attendance Staff",
  it_admin: "IT Administrator",
  teacher: "Teacher",
};

const departments = [
  "Information Technology",
  "Academic Affairs",
  "Student Services",
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Administration",
];

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = () => {
    const newStaff: StaffMember = {
      id: `STAFF-${(staff.length + 1).toString().padStart(3, "0")}`,
      fullName: formData.fullName || "",
      email: formData.email || "",
      phone: formData.phone || "",
      role: (formData.role as StaffMember["role"]) || "teacher",
      department: formData.department || "",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      address: formData.address,
      notes: formData.notes,
    };

    setStaff((prev) => [...prev, newStaff]);
    setFormData({});
    setIsAddDialogOpen(false);
    toast.success("Staff member added successfully");
  };

  const handleEditStaff = () => {
    if (!editingStaff) return;

    setStaff((prev) =>
      prev.map((member) =>
        member.id === editingStaff.id ? { ...member, ...formData } : member
      )
    );

    setEditingStaff(null);
    setFormData({});
    toast.success("Staff member updated successfully");
  };

  const handleStatusChange = (id: string, newStatus: "active" | "inactive") => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, status: newStatus } : member
      )
    );
    toast.success(
      `Staff member ${newStatus === "active" ? "activated" : "deactivated"} successfully`
    );
  };

  const handleDeleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((member) => member.id !== id));
    toast.success("Staff member deleted successfully");
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-success/10 text-success border-success/20">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      it_admin: "bg-destructive/10 text-destructive border-destructive/20",
      management_staff: "bg-primary/10 text-primary border-primary/20",
      attendance_staff: "bg-warning/10 text-warning border-warning/20",
      teacher: "bg-secondary/10 text-secondary border-secondary/20",
    };

    return (
      <Badge
        className={
          colors[role as keyof typeof colors] ||
          "bg-muted/10 text-muted-foreground border-muted/20"
        }
      >
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    );
  };

  const openEditDialog = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData(member);
  };

  const StaffFormDialog = ({ isEdit }: { isEdit: boolean }) => (
    <Dialog
      open={isEdit ? !!editingStaff : isAddDialogOpen}
      onOpenChange={isEdit ? () => setEditingStaff(null) : setIsAddDialogOpen}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update staff member information"
              : "Enter details for the new staff member"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role: value as StaffMember["role"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, department: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Enter address"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setFormData({});
              isEdit ? setEditingStaff(null) : setIsAddDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={isEdit ? handleEditStaff : handleAddStaff}>
            {isEdit ? "Update" : "Add"} Staff Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members and their roles
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {staff.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {staff.filter((s) => s.status === "inactive").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(staff.map((s) => s.department)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name & Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    {new Date(member.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(
                            member.id,
                            member.status === "active" ? "inactive" : "active"
                          )
                        }
                      >
                        {member.status === "active" ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStaff(member.id)}
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

      <StaffFormDialog isEdit={false} />
      <StaffFormDialog isEdit={true} />
    </div>
  );
}
