"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadButton } from "@/lib/uploadthing";
import {
  Loader2,
  PlusCircle,
  Printer,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

interface OfflineRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parentEmail?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string | null;
  notes?: string | null;
  studentPublicId?: string | null;
  idCardUrl?: string | null;
}

interface RegistrationStats {
  total: number;
  awaitingApproval: number;
  completed: number;
  failed: number;
}

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  parentEmail: "",
  dob: "",
  address: "",
  notes: "",
};

export function StudentRegistrationManagement() {
  const [registrations, setRegistrations] = useState<OfflineRegistration[]>([]);
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    awaitingApproval: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState<{ url: string; fileKey: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student-registration/offline");

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to load registrations");
      }

      const payload = await response.json();
      setRegistrations(payload.registrations ?? []);
      setStats(payload.stats ?? stats);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load registrations"
      );
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const awaitingApproval = useMemo(
    () => registrations.filter((registration) => registration.status === "AWAITING_APPROVAL"),
    [registrations]
  );

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(
        `/api/student-registration/offline/${id}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to approve registration");
      }

      toast.success("Registration approved and student notified");
      await fetchRegistrations();
    } catch (approveError) {
      console.error(approveError);
      toast.error(
        approveError instanceof Error
          ? approveError.message
          : "Unable to approve registration"
      );
    }
  };

  const handlePrintAll = async () => {
    try {
      const response = await fetch("/api/student-registration/print-all");

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "No ID cards available to print");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "student-id-cards.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (printError) {
      console.error(printError);
      toast.error(
        printError instanceof Error
          ? printError.message
          : "Unable to generate ID card bundle"
      );
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(INITIAL_FORM);
    setPhoto(null);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!photo) {
      toast.error("Please upload a JPEG photo for the ID card.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/student-registration/offline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          parentEmail: formState.parentEmail || null,
          notes: formState.notes || null,
          profileImage: {
            url: photo.url,
            fileKey: photo.fileKey,
            mimeType: "image/jpeg",
          },
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to create registration");
      }

      toast.success("Offline registration recorded");
      setDialogOpen(false);
      resetForm();
      await fetchRegistrations();
    } catch (createError) {
      console.error(createError);
      toast.error(
        createError instanceof Error
          ? createError.message
          : "Unable to create offline registration"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Registration Management</h1>
          <p className="text-muted-foreground">
            Review and approve student registration requests, and generate ID
            cards on demand.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchRegistrations()}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Refreshing
              </span>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintAll}>
            <Printer className="mr-2 h-4 w-4" /> Print All Cards
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add offline student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record offline registration</DialogTitle>
                <DialogDescription>
                  Create a student profile for offline payments. The ID card and
                  credentials will be generated after approval.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="firstName"
                    placeholder="First name"
                    value={formState.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    name="lastName"
                    placeholder="Last name"
                    value={formState.lastName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Student email"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    name="phone"
                    placeholder="Contact number"
                    value={formState.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    type="email"
                    name="parentEmail"
                    placeholder="Parent or guardian email"
                    value={formState.parentEmail}
                    onChange={handleInputChange}
                  />
                  <Input
                    type="date"
                    name="dob"
                    placeholder="Date of birth"
                    value={formState.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Textarea
                  name="address"
                  placeholder="Home address"
                  value={formState.address}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
                <Textarea
                  name="notes"
                  placeholder="Learning goals or internal notes"
                  value={formState.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Student photo *</p>
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (!res || res.length === 0) {
                        toast.error("Upload failed. Please try again.");
                        return;
                      }
                      setPhoto({
                        url: res[0]?.url ?? "",
                        fileKey: res[0]?.key ?? "",
                      });
                      toast.success("Photo uploaded successfully");
                    }}
                    onUploadError={(uploadError) => {
                      console.error(uploadError);
                      toast.error("Unable to upload photo");
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a recent passport-style JPEG. This image will appear on
                    the student ID card.
                  </p>
                </div>
                <DialogFooter className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> Save registration
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.awaitingApproval}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {stats.failed}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Offline registrations</CardTitle>
            <CardDescription>
              Approve registrations to trigger student ID creation and welcome
              email.
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {awaitingApproval.length} awaiting approval
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading registrations…
            </div>
          ) : registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No offline registrations recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.firstName} {registration.lastName}
                    </TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>{registration.phone}</TableCell>
                    <TableCell>
                      <StatusBadge status={registration.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {registration.status === "AWAITING_APPROVAL" ? (
                        <Button
                          size="sm"
                          onClick={() => void handleApprove(registration.id)}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      ) : registration.studentPublicId ? (
                        <div className="text-sm text-muted-foreground">
                          ID {registration.studentPublicId}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AWAITING_APPROVAL":
      return <Badge variant="secondary">Pending approval</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
