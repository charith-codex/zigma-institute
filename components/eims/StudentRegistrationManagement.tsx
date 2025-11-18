"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Eye, Search, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/utils";
import { useStudentRegistrations } from "@/hooks/useData";
import type {
  StudentRegistrationSummary,
  StudentRegistrationStatus,
} from "@/types";

const STATUS_OPTIONS: (
  | { label: string; value: "all" }
  | { label: string; value: StudentRegistrationStatus }
)[] = [
  { label: "All statuses", value: "all" },
  { label: "Pending approval", value: "PAID" },
  { label: "Approved", value: "APPROVED" },
];

export function StudentRegistrationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentRegistrationStatus>(
    "PAID"
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [regenerating, setRegenerating] = useState<Set<string>>(new Set());
  const statuses: StudentRegistrationStatus[] =
    statusFilter === "all" ? ["PAID", "APPROVED"] : [statusFilter];
  const { registrations, loading, error, refetch } = useStudentRegistrations(statuses);
  const [activeRegistration, setActiveRegistration] =
    useState<StudentRegistrationSummary | null>(null);

  useEffect(() => {
    setSelected(new Set());
  }, [statusFilter]);

  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      registrations.forEach((registration) => {
        if (prev.has(registration.id)) {
          next.add(registration.id);
        }
      });
      return next;
    });
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const matchesSearch = [
        registration.name,
        registration.email,
        registration.phone,
        registration.guardianEmail,
        registration.studentPublicId ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || registration.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const paid = registrations.filter((registration) => registration.status === "PAID").length;
    const approved = registrations.filter((registration) => registration.status === "APPROVED").length;
    const idCardsReady = registrations.filter((registration) => Boolean(registration.idCardUrl)).length;

    return { total, paid, approved, idCardsReady };
  }, [registrations]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(filteredRegistrations.map((registration) => registration.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleStatusChange = async (
    id: string,
    status: StudentRegistrationStatus
  ) => {
    try {
      const response = await fetch("/api/student-registration", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to update registration");
      }

      toast.success(
        status === "APPROVED"
          ? "Registration approved"
          : "Registration status updated"
      );
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      void refetch();
    } catch (updateError) {
      console.error("Failed to update registration", updateError);
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update registration"
      );
    }
  };

  const handleDownloadSelected = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one registration to download");
      return;
    }

    try {
      const response = await fetch("/api/student-registration/id-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to download ID cards");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "zigma-student-id-cards.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Failed to download ID cards", downloadError);
      toast.error(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download ID cards"
      );
    }
  };

  const handleRegenerateIdCard = async (registrationId: string) => {
    setRegenerating((prev) => new Set(prev).add(registrationId));
    
    try {
      const response = await fetch("/api/student-registration/regenerate-id-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to generate ID card");
      }

      toast.success("ID card generated successfully");
      void refetch();
    } catch (regenerateError) {
      console.error("Failed to regenerate ID card", regenerateError);
      toast.error(
        regenerateError instanceof Error
          ? regenerateError.message
          : "Unable to generate ID card"
      );
    } finally {
      setRegenerating((prev) => {
        const next = new Set(prev);
        next.delete(registrationId);
        return next;
      });
    }
  };

  const handlePreview = (registration: StudentRegistrationSummary) => {
    setActiveRegistration(registration);
  };

  const statusBadge = (status: StudentRegistrationStatus) => {
    switch (status) {
      case "PAID":
        return <Badge variant="secondary">Awaiting approval</Badge>;
      case "APPROVED":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            Approved
          </Badge>
        );
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Registration Management</h1>
          <p className="text-muted-foreground">
            Review payments, approve enrolments, and download ID cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSelected}
            disabled={selected.size === 0 || loading}
          >
            <Download className="mr-2 h-4 w-4" /> Download selected
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ID cards ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {stats.idCardsReady}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Online registrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student, email, or ID"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | StudentRegistrationStatus)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredRegistrations.length > 0 &&
                      filteredRegistrations.every((registration) =>
                        selected.has(registration.id)
                      )
                    }
                    onCheckedChange={(value) => toggleSelectAll(value === true)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(registration.id)}
                      onCheckedChange={() => toggleSelect(registration.id)}
                      aria-label={`Select ${registration.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {registration.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {registration.email}
                      </span>
                      {registration.studentPublicId ? (
                        <span className="text-xs text-muted-foreground">
                          ID: {registration.studentPublicId}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span>Guardian: {registration.guardianEmail}</span>
                      <span>Phone: {registration.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {registration.courses.join(", ") || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(
                        registration.totalAmountInCents,
                        registration.currency
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(registration.status)}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(registration)}
                      aria-label="Preview registration"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {registration.idCardUrl ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(registration.idCardUrl ?? "#", "_blank")}
                        aria-label="Download ID card"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerateIdCard(registration.id)}
                        disabled={regenerating.has(registration.id)}
                        aria-label="Generate ID card"
                      >
                        <RefreshCw className={`h-4 w-4 ${regenerating.has(registration.id) ? "animate-spin" : ""}`} />
                      </Button>
                    )}
                    {registration.status === "PAID" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(registration.id, "APPROVED")}
                        aria-label="Approve registration"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                    ) : null}
                    {registration.status === "PAID" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(registration.id, "FAILED")}
                        aria-label="Reject registration"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRegistrations.length === 0 && !loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No registrations found.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(activeRegistration)} onOpenChange={() => setActiveRegistration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration details</DialogTitle>
            <DialogDescription>
              Review the information submitted during online registration.
            </DialogDescription>
          </DialogHeader>
          {activeRegistration ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">Student</p>
                <p>{activeRegistration.name}</p>
                <p className="text-muted-foreground">{activeRegistration.email}</p>
                <p className="text-muted-foreground">Phone: {activeRegistration.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Guardian email</p>
                <p className="text-muted-foreground">
                  {activeRegistration.guardianEmail}
                </p>
              </div>
              {activeRegistration.gender ? (
                <div>
                  <p className="font-semibold text-foreground">Gender</p>
                  <p className="text-muted-foreground">
                    {activeRegistration.gender === "MALE" ? "Male" : "Female"}
                  </p>
                </div>
              ) : null}
              {activeRegistration.address ? (
                <div>
                  <p className="font-semibold text-foreground">Postal address</p>
                  <p className="text-muted-foreground">{activeRegistration.address}</p>
                </div>
              ) : null}
              <div>
                <p className="font-semibold text-foreground">Courses</p>
                <p className="text-muted-foreground">
                  {activeRegistration.courses.join(", ") || "Assigned post-approval"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Total payment</p>
                <p>
                  {formatCurrency(
                    activeRegistration.totalAmountInCents,
                    activeRegistration.currency
                  )}
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRegistration(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
