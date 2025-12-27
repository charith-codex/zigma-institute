"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  HandCoins,
  PieChart,
  Plus,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePayments, useCourses, useEnrollments } from "@/hooks/useData";
import { toast } from "sonner";
import { formatMonthLabel, formatCurrency as formatCurrencyDisplay } from "@/lib/utils";

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

interface ManualPaymentFormData {
  studentId: string;
  courseId: string;
  amount: number; // Amount in dollars (user input)
  monthYear: string;
  notes: string;
}

const FeeManagement = () => {
  const { payments, summary, loading, error, refetch } = usePayments();
  const { courses } = useCourses();
  const { enrollments } = useEnrollments();

  const [paymentMethodFilter, setPaymentMethodFilter] = useState<"all" | "online" | "manual">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ManualPaymentFormData>({
    studentId: "",
    courseId: "",
    amount: 0,
    monthYear: getCurrentMonthYear(),
    notes: "",
  });

  // Get unique students from enrollments
  const studentsWithEnrollments = useMemo(() => {
    const studentMap = new Map<string, { id: string; name: string; email: string; courseIds: string[] }>();
    
    enrollments.forEach((enrollment) => {
      const student = enrollment.student;
      if (!student) return;
      
      const existing = studentMap.get(student.userId);
      if (existing) {
        if (!existing.courseIds.includes(enrollment.courseId)) {
          existing.courseIds.push(enrollment.courseId);
        }
      } else {
        studentMap.set(student.userId, {
          id: student.userId,
          name: student.name,
          email: student.email,
          courseIds: [enrollment.courseId],
        });
      }
    });
    
    return Array.from(studentMap.values());
  }, [enrollments]);

  // Filter courses based on selected student's enrollments
  const availableCoursesForStudent = useMemo(() => {
    if (!formData.studentId) return [];
    const student = studentsWithEnrollments.find((s) => s.id === formData.studentId);
    if (!student) return [];
    return courses.filter((c) => student.courseIds.includes(c.id));
  }, [formData.studentId, studentsWithEnrollments, courses]);

  // Filter payments based on payment method
  const filteredPayments = useMemo(() => {
    if (paymentMethodFilter === "all") return payments;
    return payments.filter((p) => p.paymentMethod === paymentMethodFilter.toUpperCase());
  }, [payments, paymentMethodFilter]);

  const currency = payments[0]?.currency ?? "USD";
  const thisMonthKey = getCurrentMonthYear();
  const thisMonthIncome = summary?.monthlyIncome.find(
    (item) => item.month === thisMonthKey
  )?.totalInCents;

  const handleManualPaymentSubmit = async () => {
    if (!formData.studentId || !formData.courseId || formData.amount <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          courseId: formData.courseId,
          amountInCents: Math.round(formData.amount * 100), // Convert dollars to cents
          monthYear: formData.monthYear,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to record payment");
      }

      toast.success("Manual payment recorded successfully");
      setDialogOpen(false);
      setFormData({
        studentId: "",
        courseId: "",
        amount: 0,
        monthYear: getCurrentMonthYear(),
        notes: "",
      });
      void refetch();
    } catch (err) {
      console.error("Failed to record manual payment", err);
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Failed to load fee data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button onClick={() => void refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-muted-foreground">
            Track student payments across courses, months, and registration fees.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Manual Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Manual Payment</DialogTitle>
              <DialogDescription>
                Record a cash or other offline payment for a student&apos;s monthly fee.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, studentId: value, courseId: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsWithEnrollments.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  disabled={!formData.studentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCoursesForStudent.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthYear">Month</Label>
                  <Input
                    id="monthYear"
                    type="month"
                    value={formData.monthYear}
                    onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Paid via bank transfer"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleManualPaymentSubmit} disabled={submitting}>
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyDisplay(summary?.totalIncomeInCents ?? 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground">All recorded payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyDisplay(summary?.onlineIncomeInCents ?? 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Stripe payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Payments</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyDisplay(summary?.manualIncomeInCents ?? 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Cash/offline payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyDisplay(thisMonthIncome ?? 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Month-to-date collections</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Registration + monthly installments</CardDescription>
              </div>
              <Tabs value={paymentMethodFilter} onValueChange={(v) => setPaymentMethodFilter(v as typeof paymentMethodFilter)}>
                <TabsList className="grid grid-cols-3 w-[240px]">
                  <TabsTrigger value="all" className="gap-1">
                    <Wallet className="h-3 w-3" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="online" className="gap-1">
                    <CreditCard className="h-3 w-3" />
                    Online
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-1">
                    <HandCoins className="h-3 w-3" />
                    Manual
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course / Type</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.transactionId ?? payment.id}>
                      <TableCell>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment.studentEmail ?? "No email"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {payment.courseName ?? "Registration"}
                          </span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="w-fit">
                              {payment.paymentType === "REGISTRATION"
                                ? "First month"
                                : `Month ${payment.monthNumber ?? ""}`}
                            </Badge>
                            {payment.monthYear && (
                              <Badge variant="secondary" className="w-fit">
                                {formatMonthLabel(payment.monthYear)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrencyDisplay(payment.amountInCents, payment.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.paymentMethod === "ONLINE" ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {payment.paymentMethod === "ONLINE" ? (
                            <>
                              <CreditCard className="h-3 w-3" />
                              Online
                            </>
                          ) : (
                            <>
                              <HandCoins className="h-3 w-3" />
                              Manual
                            </>
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Income</CardTitle>
            <CardDescription>Cash flow by month (Online / Manual)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.monthlyIncome.length ? (
              summary.monthlyIncome.map((month) => (
                <div key={month.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span>{formatMonthLabel(month.month)}</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrencyDisplay(month.totalInCents, currency)}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground pl-6">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {formatCurrencyDisplay(month.onlineInCents, currency)}
                    </span>
                    <span className="flex items-center gap-1">
                      <HandCoins className="h-3 w-3" />
                      {formatCurrencyDisplay(month.manualInCents, currency)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No monthly history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course-wise revenue</CardTitle>
            <CardDescription>Installments + first month fees</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.courseTotals.length ? (
                  summary.courseTotals.map((course) => (
                    <TableRow key={course.courseId}>
                      <TableCell className="font-medium">{course.courseName}</TableCell>
                      <TableCell>{course.payments}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrencyDisplay(course.totalInCents, currency)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No course payments yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student-wise payments</CardTitle>
            <CardDescription>All payments per student</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.studentTotals.length ? (
                  summary.studentTotals.map((student) => (
                    <TableRow key={student.studentId ?? student.studentEmail ?? student.studentName}>
                      <TableCell>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.studentEmail ?? "No email"}
                        </div>
                      </TableCell>
                      <TableCell>{student.payments}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrencyDisplay(student.totalInCents, currency)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No student payments yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeeManagement;
