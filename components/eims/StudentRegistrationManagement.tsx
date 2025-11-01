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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Check,
  X,
  UserPlus,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface StudentRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  course: string;
  feeAmount: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  guardianName?: string;
  guardianPhone?: string;
}

const mockRegistrations: StudentRegistration[] = [
  {
    id: "REG-001",
    fullName: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1-555-0101",
    dateOfBirth: "2005-03-15",
    address: "123 Main St, Springfield, IL",
    course: "Computer Science",
    feeAmount: 5000,
    status: "pending",
    submittedAt: "2024-01-15T10:30:00",
    guardianName: "Robert Johnson",
    guardianPhone: "+1-555-0102",
  },
  {
    id: "REG-002",
    fullName: "Bob Smith",
    email: "bob.smith@email.com",
    phone: "+1-555-0103",
    dateOfBirth: "2004-07-22",
    address: "456 Oak Ave, Springfield, IL",
    course: "Mathematics",
    feeAmount: 4500,
    status: "approved",
    submittedAt: "2024-01-14T14:20:00",
  },
  {
    id: "REG-003",
    fullName: "Carol Davis",
    email: "carol.davis@email.com",
    phone: "+1-555-0104",
    dateOfBirth: "2005-11-08",
    address: "789 Pine Rd, Springfield, IL",
    course: "Physics",
    feeAmount: 4800,
    status: "rejected",
    submittedAt: "2024-01-13T09:45:00",
  },
];

export function StudentRegistrationManagement() {
  const [registrations, setRegistrations] =
    useState<StudentRegistration[]>(mockRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] =
    useState<StudentRegistration | null>(null);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    setRegistrations((prev) =>
      prev.map((reg) => (reg.id === id ? { ...reg, status: newStatus } : reg))
    );
    toast.success(`Registration ${newStatus} successfully`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Student Registration Management
          </h1>
          <p className="text-muted-foreground">
            Review and approve student registration requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {registrations.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {registrations.filter((r) => r.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {registrations.filter((r) => r.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Fee Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">
                    {registration.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{registration.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {registration.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{registration.course}</TableCell>
                  <TableCell>
                    ${registration.feeAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(registration.status)}</TableCell>
                  <TableCell>
                    {new Date(registration.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedRegistration(registration)
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Registration Details - {registration.id}
                            </DialogTitle>
                            <DialogDescription>
                              Complete registration information for{" "}
                              {registration.fullName}
                            </DialogDescription>
                          </DialogHeader>

                          {selectedRegistration && (
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Full Name
                                  </label>
                                  <p className="text-sm">
                                    {selectedRegistration.fullName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Email
                                  </label>
                                  <p className="text-sm">
                                    {selectedRegistration.email}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Phone
                                  </label>
                                  <p className="text-sm">
                                    {selectedRegistration.phone}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Date of Birth
                                  </label>
                                  <p className="text-sm">
                                    {selectedRegistration.dateOfBirth}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Course
                                  </label>
                                  <p className="text-sm">
                                    {selectedRegistration.course}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Fee Amount
                                  </label>
                                  <p className="text-sm">
                                    $
                                    {selectedRegistration.feeAmount.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                  </label>
                                  <div className="mt-1">
                                    {getStatusBadge(
                                      selectedRegistration.status
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Submitted At
                                  </label>
                                  <p className="text-sm">
                                    {new Date(
                                      selectedRegistration.submittedAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Address
                                </label>
                                <p className="text-sm">
                                  {selectedRegistration.address}
                                </p>
                              </div>

                              {selectedRegistration.guardianName && (
                                <div className="col-span-2 border-t pt-3">
                                  <h4 className="font-medium mb-2">
                                    Guardian Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Guardian Name
                                      </label>
                                      <p className="text-sm">
                                        {selectedRegistration.guardianName}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Guardian Phone
                                      </label>
                                      <p className="text-sm">
                                        {selectedRegistration.guardianPhone}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedRegistration?.status === "pending" && (
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  handleStatusChange(
                                    selectedRegistration.id,
                                    "rejected"
                                  );
                                  setSelectedRegistration(null);
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => {
                                  handleStatusChange(
                                    selectedRegistration.id,
                                    "approved"
                                  );
                                  setSelectedRegistration(null);
                                }}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>

                      {registration.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(registration.id, "approved")
                            }
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(registration.id, "rejected")
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
