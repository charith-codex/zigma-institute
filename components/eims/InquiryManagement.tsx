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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: "general" | "admission" | "technical" | "complaint" | "feedback";
  status: "new" | "in_progress" | "resolved" | "closed";
  submittedAt: string;
  respondedAt?: string;
  assignedTo?: string;
  response?: string;
}

const mockInquiries: Inquiry[] = [
  {
    id: "INQ-001",
    name: "John Smith",
    email: "john.smith@email.com",
    subject: "Course Information Request",
    message:
      "I would like to know more about your Computer Science program, including the curriculum, duration, and admission requirements.",
    inquiryType: "admission",
    status: "new",
    submittedAt: "2024-01-15T14:30:00",
  },
  {
    id: "INQ-002",
    name: "Emily Johnson",
    email: "emily.johnson@email.com",
    subject: "Technical Issue with Portal",
    message:
      "I'm having trouble accessing the student portal. It shows an error message when I try to log in with my credentials.",
    inquiryType: "technical",
    status: "in_progress",
    submittedAt: "2024-01-14T16:45:00",
    assignedTo: "IT Support Team",
  },
  {
    id: "INQ-003",
    name: "Michael Davis",
    email: "michael.davis@email.com",
    subject: "Fee Payment Query",
    message:
      "I need clarification on the fee structure for the Physics program and available payment plans.",
    inquiryType: "general",
    status: "resolved",
    submittedAt: "2024-01-13T10:20:00",
    respondedAt: "2024-01-13T15:30:00",
    assignedTo: "Finance Team",
    response:
      "Thank you for your inquiry. Our Finance team has sent you detailed information about the fee structure and payment options to your email address.",
  },
  {
    id: "INQ-004",
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    subject: "Complaint about Course Schedule",
    message:
      "The recent changes to the course schedule are causing conflicts with my work schedule. This is affecting my ability to attend classes regularly.",
    inquiryType: "complaint",
    status: "new",
    submittedAt: "2024-01-15T09:15:00",
  },
];

const inquiryTypeLabels = {
  general: "General",
  admission: "Admission",
  technical: "Technical",
  complaint: "Complaint",
  feedback: "Feedback",
};

const statusLabels = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function InquiryManagement() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState("");

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || inquiry.inquiryType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: Inquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
      )
    );
    toast.success(`Inquiry status updated to ${statusLabels[newStatus]}`);
  };

  const handleSendResponse = () => {
    if (!selectedInquiry || !responseText.trim()) return;

    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.id === selectedInquiry.id
          ? {
              ...inquiry,
              status: "resolved",
              response: responseText,
              respondedAt: new Date().toISOString(),
              assignedTo: "Admin Team",
            }
          : inquiry
      )
    );

    setResponseText("");
    setSelectedInquiry(null);
    toast.success("Response sent successfully");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: "bg-primary/10 text-primary border-primary/20",
      in_progress: "bg-warning/10 text-warning border-warning/20",
      resolved: "bg-success/10 text-success border-success/20",
      closed: "bg-muted/10 text-muted-foreground border-muted/20",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      general: "bg-sky-400/10 text-sky-500 border-sky-600/20",
      admission: "bg-primary/10 text-primary border-primary/20",
      technical: "bg-warning/10 text-warning border-warning/20",
      complaint: "bg-destructive/10 text-destructive border-destructive/20",
      feedback: "bg-success/10 text-success border-success/20",
    };

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {inquiryTypeLabels[type as keyof typeof inquiryTypeLabels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inquiry Management</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions and customer inquiries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {inquiries.filter((i) => i.status === "new").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {inquiries.filter((i) => i.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {inquiries.filter((i) => i.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiry List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Inquiries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(inquiryTypeLabels).map(([key, label]) => (
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
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{inquiry.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {inquiry.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">
                      {inquiry.subject}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {inquiry.message.substring(0, 60)}...
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(inquiry.inquiryType)}</TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) =>
                        handleStatusChange(
                          inquiry.id,
                          value as Inquiry["status"]
                        )
                      }
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(inquiry.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(inquiry.submittedAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              Inquiry Details - {inquiry.id}
                            </DialogTitle>
                            <DialogDescription>
                              {inquiry.subject}
                            </DialogDescription>
                          </DialogHeader>

                          {selectedInquiry && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Name
                                    </label>
                                    <p className="text-sm">
                                      {selectedInquiry.name}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Email
                                    </label>
                                    <p className="text-sm">
                                      {selectedInquiry.email}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Type
                                    </label>
                                    <div className="mt-1">
                                      {getTypeBadge(
                                        selectedInquiry.inquiryType
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Status
                                    </label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedInquiry.status)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Message
                                </label>
                                <div className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">
                                  {selectedInquiry.message}
                                </div>
                              </div>

                              {selectedInquiry.response && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Previous Response
                                  </label>
                                  <div className="mt-1 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                                    {selectedInquiry.response}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Responded on{" "}
                                    {selectedInquiry.respondedAt
                                      ? new Date(
                                          selectedInquiry.respondedAt
                                        ).toLocaleString()
                                      : "N/A"}
                                  </p>
                                </div>
                              )}

                              {selectedInquiry.status !== "resolved" &&
                                selectedInquiry.status !== "closed" && (
                                  <div>
                                    <Label htmlFor="response">
                                      Send Response
                                    </Label>
                                    <Textarea
                                      id="response"
                                      value={responseText}
                                      onChange={(e) =>
                                        setResponseText(e.target.value)
                                      }
                                      placeholder="Type your response here..."
                                      rows={4}
                                      className="mt-2"
                                    />
                                  </div>
                                )}
                            </div>
                          )}

                          <DialogFooter>
                            {selectedInquiry?.status !== "resolved" &&
                              selectedInquiry?.status !== "closed" && (
                                <Button
                                  onClick={handleSendResponse}
                                  disabled={!responseText.trim()}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Send Response
                                </Button>
                              )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
