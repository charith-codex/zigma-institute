"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Percent,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateDiscountRate,
  computeDurationInMonths,
  deriveMonthlyAmount,
} from "@/lib/payments";

interface PaymentCourse {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
  teacherName: string | null;
  createdAt: string;
  updatedAt: string;
  enrolledAt: string;
}

interface PaymentStudent {
  id: string;
  name: string | null;
  email: string | null;
}

interface PaymentResponse {
  student: PaymentStudent;
  courses: PaymentCourse[];
}

interface PaymentVerificationResult {
  paid: boolean;
  courseId: string | null;
  planId: string | null;
  amountPaidInCents: number | null;
  currency: string | null;
  transactionId: string | null;
}

interface CoursePaymentPlan {
  id: string;
  courseId: string;
  courseName: string;
  monthlyAmountInCents: number;
  discountRate: number;
  monthsRemaining: number;
  totalMonths: number;
  nextDueDate: string;
}

interface PaymentReceipt {
  id: string;
  courseId: string | null;
  courseName: string | null;
  paidOn: string;
  amountPaidInCents: number;
  monthNumber: number;
  transactionId: string;
  currency?: string;
  paymentType?: "INSTALLMENT" | "REGISTRATION";
  discountRate?: number | null;
}

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );

const calculateNextDueDate = (enrolledAt: string, completedPayments: number) => {
  const anchor = new Date(enrolledAt);
  anchor.setMonth(anchor.getMonth() + completedPayments);

  return new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
};

const daysUntil = (target: Date) => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const PaymentSection = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [student, setStudent] = useState<PaymentStudent | null>(null);
  const [courses, setCourses] = useState<PaymentCourse[]>([]);
  const [history, setHistory] = useState<PaymentReceipt[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const discountRate = useMemo(
    () => calculateDiscountRate(courses.length),
    [courses.length]
  );

  const activeCurrency = courses[0]?.currency ?? "USD";

  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments", { cache: "no-store" });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load payment information.");
      }

      const payload = (await response.json()) as PaymentResponse;
      setStudent(payload.student);
      setCourses(payload.courses ?? []);
    } catch (fetchError) {
      console.error("Failed to fetch payment data", fetchError);
      setStudent(null);
      setCourses([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load payment information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentHistory = useCallback(async () => {
    if (!student) return;

    try {
      const response = await fetch("/api/payments/history", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as PaymentReceipt[];
      setHistory(
        payload.map((entry) => ({
          ...entry,
          monthNumber: entry.monthNumber ?? 1,
          paymentType: entry.paymentType ?? "INSTALLMENT",
        }))
      );
    } catch (historyError) {
      console.error("Failed to load payment history", historyError);
    }
  }, [student]);

  useEffect(() => {
    void fetchPaymentData();
  }, [fetchPaymentData, refreshKey]);

  useEffect(() => {
    if (!student) return;

    void fetchPaymentHistory();
  }, [fetchPaymentHistory, student]);

  useEffect(() => {
    if (!student) return;

    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const returnedPlanId = searchParams.get("planId");
    const returnedCourseId = searchParams.get("courseId");

    if (paymentStatus !== "success" || !sessionId) return;

    const finalizePayment = async () => {
      setProcessingId(returnedPlanId ?? returnedCourseId);

      try {
        const response = await fetch(
          `/api/payments/checkout?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Unable to verify payment session.");
        }

        const payload = (await response.json()) as PaymentVerificationResult;

        if (!payload.paid) {
          return;
        }

        await fetchPaymentHistory();
        await fetchPaymentData();
      } catch (verificationError) {
        console.error("Failed to record payment", verificationError);
      } finally {
        setProcessingId(null);

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("payment");
        currentUrl.searchParams.delete("courseId");
        currentUrl.searchParams.delete("planId");
        currentUrl.searchParams.delete("session_id");
        window.history.replaceState({}, document.title, currentUrl.toString());
      }
    };

    void finalizePayment();
  }, [fetchPaymentData, fetchPaymentHistory, searchParams, student]);

  const pendingPlans = useMemo(() => {
    if (!student) return [] as CoursePaymentPlan[];

    return courses
      .map((course) => {
        const totalMonths = computeDurationInMonths(course.priceInCents);
        const paidInstallments = history.filter(
          (entry) =>
            entry.courseId === course.id && entry.paymentType === "INSTALLMENT"
        ).length;
        const monthsRemaining = Math.max(totalMonths - paidInstallments, 0);

        if (monthsRemaining <= 0) {
          return null;
        }

        const monthlyAmount = deriveMonthlyAmount(course.priceInCents);
        const nextDue = calculateNextDueDate(course.enrolledAt, paidInstallments);

        return {
          id: `plan-${course.id}`,
          courseId: course.id,
          courseName: course.name,
          monthlyAmountInCents: monthlyAmount,
          discountRate,
          monthsRemaining,
          totalMonths,
          nextDueDate: nextDue.toISOString(),
        } satisfies CoursePaymentPlan;
      })
      .filter((plan): plan is CoursePaymentPlan => plan !== null);
  }, [courses, discountRate, history, student]);

  const totalPending = useMemo(
    () =>
      pendingPlans.reduce(
        (total, plan) =>
          total + Math.round(plan.monthlyAmountInCents * (1 - plan.discountRate)),
        0
      ),
    [pendingPlans]
  );

  const handlePayment = async (planId: string, courseId: string) => {
    const targetPlan = pendingPlans.find((plan) => plan.id === planId);
    if (!targetPlan) return;

    setProcessingId(planId);
    setError(null);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, planId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Unable to start checkout.");
      }

      const payload = (await response.json()) as { url?: string };

      if (!payload.url) {
        throw new Error("Invalid checkout response from server.");
      }

      window.location.href = payload.url;
    } catch (paymentError) {
      console.error("Failed to initiate payment", paymentError);
      setProcessingId(null);
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start checkout."
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-2 p-6">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => fetchPaymentData()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-muted-foreground">
            Pay monthly installments until each course ends. Discounts apply when you
            subscribe to multiple courses in the same period.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>
              {student.name ?? "Student"} • {student.email ?? "No email on file"}
            </span>
          </div>
        </div>
        {discountRate > 0 && (
          <Badge variant="secondary" className="gap-2 px-3 py-1">
            <Percent className="h-4 w-4" />
            {Math.round(discountRate * 100)}% bundle discount active
          </Badge>
        )}
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No active enrollments</h3>
            <p className="text-muted-foreground">
              Enroll in a course to see your monthly payments and discounts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Due This Month</p>
                    <p className="text-xl font-bold">{formatCurrency(totalPending, activeCurrency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-xl font-bold">{pendingPlans.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payments Completed</p>
                    <p className="text-xl font-bold">{history.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Due payments
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Successful payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingPlans.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
                    <h3 className="mb-2 text-lg font-semibold">All caught up</h3>
                    <p className="text-muted-foreground">
                      You have paid every installment for your enrolled courses.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingPlans.map((plan) => {
                    const discountedAmount = Math.round(
                      plan.monthlyAmountInCents * (1 - plan.discountRate)
                    );
                    const dueDate = new Date(plan.nextDueDate);
                    const daysRemaining = daysUntil(dueDate);
                    const isOverdue = daysRemaining < 0;
                    const reminderLabel = isOverdue
                      ? `Overdue by ${Math.abs(daysRemaining)} day(s)`
                      : daysRemaining === 0
                        ? "Due today"
                        : `Due in ${daysRemaining} day(s)`;

                    return (
                      <Card
                        key={plan.id}
                        className={plan.monthsRemaining <= 1 ? "border-success/40" : ""}
                      >
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                          <div>
                            <CardTitle className="text-lg">{plan.courseName}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {plan.monthsRemaining} monthly payment(s) left
                            </p>
                          </div>
                          {plan.discountRate > 0 && (
                            <Badge variant="outline" className="gap-2">
                              <Percent className="h-3 w-3" />
                              {Math.round(plan.discountRate * 100)}% off
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold text-foreground">
                                {formatCurrency(discountedAmount, activeCurrency)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (from {formatCurrency(plan.monthlyAmountInCents, activeCurrency)})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Due by {dueDate.toLocaleDateString()}
                              </span>
                            </div>
                            <Badge
                              variant={isOverdue ? "destructive" : "secondary"}
                              className="gap-2"
                            >
                              <Clock className="h-3 w-3" />
                              {reminderLabel}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="gap-2"
                              onClick={() => handlePayment(plan.id, plan.courseId)}
                              disabled={processingId === plan.id}
                            >
                              <CreditCard className="h-4 w-4" />
                              {processingId === plan.id
                                ? "Processing..."
                                : `Pay ${formatCurrency(discountedAmount, activeCurrency)}`}
                            </Button>
                            <Badge variant="secondary" className="gap-2">
                              <Clock className="h-3 w-3" />
                              Month {plan.totalMonths - plan.monthsRemaining + 1} of {plan.totalMonths}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {history.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No payments recorded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {history
                    .slice()
                    .reverse()
                    .map((receipt) => (
                      <Card key={receipt.id}>
                        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{receipt.courseName ?? "Course"}</p>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(
                                receipt.amountPaidInCents,
                                receipt.currency ?? activeCurrency
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {receipt.paymentType === "REGISTRATION" ? "Registration" : "Installment"} • Month {receipt.monthNumber}
                              {receipt.discountRate ? ` • ${Math.round(receipt.discountRate * 100)}% discount` : ""} • Transaction {receipt.transactionId}
                            </p>
                          </div>
                          <Badge className="gap-2 self-start bg-success/10 text-success hover:bg-success/10">
                            <CheckCircle className="h-4 w-4" />
                            Paid on {new Date(receipt.paidOn).toLocaleDateString()}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
