"use client";

import { useEffect, useMemo, useState } from "react";
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

import {
  inquiryStatusLabels,
  inquiryTypeLabels,
  type InquiryRecord,
  type InquiryStatus,
  type InquiryType,
} from "@/types/inquiries";

const statusColors: Record<InquiryStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted/10 text-muted-foreground border-muted/20",
};

const typeColors: Record<InquiryType, string> = {
  general: "bg-sky-400/10 text-sky-500 border-sky-600/20",
  admission: "bg-primary/10 text-primary border-primary/20",
  technical: "bg-warning/10 text-warning border-warning/20",
  complaint: "bg-destructive/10 text-destructive border-destructive/20",
  feedback: "bg-success/10 text-success border-success/20",
};

export function InquiryManagement() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [selectedInquiry, setSelectedInquiry] =
    useState<InquiryRecord | null>(null);
  const [responseText, setResponseText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchInquiries = async () => {
      try {
        const response = await fetch("/api/inquiries", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load inquiries.");
        }

        if (isMounted) {
          setInquiries(payload as InquiryRecord[]);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load inquiries.";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchInquiries();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredInquiries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const matchesTerm =
        !term ||
        inquiry.name.toLowerCase().includes(term) ||
        inquiry.email.toLowerCase().includes(term) ||
        inquiry.subject.toLowerCase().includes(term);

      const matchesType =
        typeFilter === "all" || inquiry.inquiryType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || inquiry.status === statusFilter;

      return matchesTerm && matchesType && matchesStatus;
    });
  }, [inquiries, searchTerm, typeFilter, statusFilter]);

  const updateInquiryState = (updated: InquiryRecord) => {
    setInquiries((prev) =>
      prev.map((inquiry) => (inquiry.id === updated.id ? updated : inquiry))
    );

    setSelectedInquiry((current) =>
      current && current.id === updated.id ? updated : current
    );
  };

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setStatusUpdatingId(id);

    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update status.");
      }

      updateInquiryState(payload as InquiryRecord);
      toast.success(`Inquiry status updated to ${inquiryStatusLabels[newStatus]}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update status.";
      toast.error(message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) return;

    setIsResponding(true);

    try {
      const response = await fetch(
        `/api/inquiries/${selectedInquiry.id}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send response.");
      }

      updateInquiryState(payload as InquiryRecord);
      setResponseText("");
      setSelectedInquiry(null);
      toast.success("Response sent successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send response.";
      toast.error(message);
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => (
    <Badge className={statusColors[status]}>
      {inquiryStatusLabels[status]}
    </Badge>
  );

  const getTypeBadge = (type: InquiryType) => (
    <Badge className={typeColors[type]}>
      {inquiryTypeLabels[type]}
    </Badge>
  );

  const stats = useMemo(() => {
    const counts: Record<InquiryStatus, number> = {
      new: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    inquiries.forEach((inquiry) => {
      counts[inquiry.status] += 1;
    });

    return counts;
  }, [inquiries]);

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
            <div className="text-2xl font-bold text-primary">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Inquiries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
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
                {Object.entries(inquiryStatusLabels).map(([key, label]) => (
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Loading inquiries...
                  </TableCell>
                </TableRow>
              ) : filteredInquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInquiries.map((inquiry) => (
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
                      <div className="truncate font-medium">{inquiry.subject}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {inquiry.message.substring(0, 60)}...
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(inquiry.inquiryType)}</TableCell>
                    <TableCell>
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) =>
                          handleStatusChange(inquiry.id, value as InquiryStatus)
                        }
                        disabled={statusUpdatingId === inquiry.id}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(inquiryStatusLabels).map(([key, label]) => (
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
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setResponseText(inquiry.response ?? "");
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Inquiry Details - {inquiry.id}</DialogTitle>
                              <DialogDescription>{inquiry.subject}</DialogDescription>
                            </DialogHeader>

                            {selectedInquiry && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Name
                                      </label>
                                      <p className="text-sm">{selectedInquiry.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Email
                                      </label>
                                      <p className="text-sm">{selectedInquiry.email}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Type
                                      </label>
                                      <div className="mt-1">
                                        {getTypeBadge(selectedInquiry.inquiryType)}
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
                                      Responded on {selectedInquiry.respondedAt
                                        ? new Date(selectedInquiry.respondedAt).toLocaleString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                )}

                                {selectedInquiry.status !== "resolved" &&
                                  selectedInquiry.status !== "closed" && (
                                    <div>
                                      <Label htmlFor="response">Send Response</Label>
                                      <Textarea
                                        id="response"
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
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
                                    disabled={!responseText.trim() || isResponding}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {isResponding ? "Sending..." : "Send Response"}
                                  </Button>
                                )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
