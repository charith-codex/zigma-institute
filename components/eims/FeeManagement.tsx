"use client";

import React from "react";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  ListChecks,
  PieChart,
  Users,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayments } from "@/hooks/useData";

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const FeeManagement = () => {
  const { payments, summary, loading, error, refetch } = usePayments();

  const currency = payments[0]?.currency ?? "USD";
  const thisMonthKey = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;
  const thisMonthIncome = summary?.monthlyIncome.find(
    (item) => item.month === thisMonthKey
  )?.totalInCents;

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
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Fee Management</h2>
        <p className="text-muted-foreground">
          Track student payments across courses, months, and registration fees.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalIncomeInCents ?? 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground">All recorded payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(thisMonthIncome ?? 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Month-to-date collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Paying</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.studentTotals.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Unique payers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Covered</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.courseTotals.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Course-wise revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Registration + monthly installments</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course / Type</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
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
                          <Badge variant="outline" className="w-fit">
                            {payment.paymentType === "REGISTRATION"
                              ? "First month / registration"
                              : "Monthly installment"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amountInCents, payment.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(payment.paidAt).toLocaleDateString()}
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
            <CardDescription>Cash flow by month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.monthlyIncome.length ? (
              summary.monthlyIncome.map((month) => (
                <div key={month.month} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                    <span>{formatMonthLabel(month.month)}</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(month.totalInCents, currency)}
                  </span>
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
                        {formatCurrency(course.totalInCents, currency)}
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
                        {formatCurrency(student.totalInCents, currency)}
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
