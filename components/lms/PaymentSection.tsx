"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard, DollarSign, Percent, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLAN_STORAGE_KEY = "lms-course-payment-plans";
const HISTORY_STORAGE_KEY = "lms-course-payment-history";
const MINIMUM_MONTHLY_CENTS = 2500;

interface PaymentCourse {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
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
  courseName: string;
  paidOn: string;
  amountPaidInCents: number;
  monthNumber: number;
  transactionId: string;
}

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );

const calculateDiscountRate = (courseCount: number) => {
  if (courseCount >= 5) return 0.15;
  if (courseCount >= 3) return 0.1;
  return 0;
};

const addMonths = (date: string | Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
};

const computeDuration = (course: PaymentCourse) => {
  const normalizedPrice = Math.max(course.priceInCents, MINIMUM_MONTHLY_CENTS);
  const estimatedMonths = Math.ceil(normalizedPrice / 15000);
  return Math.min(12, Math.max(4, estimatedMonths));
};

const deriveMonthlyAmount = (course: PaymentCourse) => {
  const duration = computeDuration(course);
  return Math.max(Math.round(course.priceInCents / duration), MINIMUM_MONTHLY_CENTS);
};

const buildDefaultPlan = (
  course: PaymentCourse,
  index: number,
  discountRate: number
): CoursePaymentPlan => {
  const duration = computeDuration(course);
  const offsetDate = addMonths(new Date(), index % 2 === 0 ? 0 : 1);

  return {
    id: `plan-${course.id}`,
    courseId: course.id,
    courseName: course.name,
    monthlyAmountInCents: deriveMonthlyAmount(course),
    discountRate,
    monthsRemaining: duration,
    totalMonths: duration,
    nextDueDate: offsetDate,
  } satisfies CoursePaymentPlan;
};

const planStorageKey = (studentId: string) => `${PLAN_STORAGE_KEY}-${studentId}`;
const historyStorageKey = (studentId: string) => `${HISTORY_STORAGE_KEY}-${studentId}`;

export const PaymentSection = () => {
  const [student, setStudent] = useState<PaymentStudent | null>(null);
  const [courses, setCourses] = useState<PaymentCourse[]>([]);
  const [plans, setPlans] = useState<CoursePaymentPlan[]>([]);
  const [history, setHistory] = useState<PaymentReceipt[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const discountRate = useMemo(
    () => calculateDiscountRate(courses.length),
    [courses.length]
  );

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

  useEffect(() => {
    void fetchPaymentData();
  }, [fetchPaymentData]);

  useEffect(() => {
    if (!student) return;

    const planKey = planStorageKey(student.id);
    const historyKey = historyStorageKey(student.id);

    const storedPlans = localStorage.getItem(planKey);
    const storedHistory = localStorage.getItem(historyKey);

    const defaultPlans = courses.map((course, index) =>
      buildDefaultPlan(course, index, discountRate)
    );

    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory) as PaymentReceipt[];
      setHistory(parsedHistory);
    } else {
      setHistory([]);
    }

    if (storedPlans) {
      const parsedPlans = JSON.parse(storedPlans) as CoursePaymentPlan[];
      const courseIds = new Set(courses.map((course) => course.id));

      const normalizedPlans = parsedPlans
        .filter((plan) => courseIds.has(plan.courseId))
        .map((plan) => ({
          ...plan,
          discountRate,
        }));

      const missingPlans = defaultPlans.filter(
        (plan) => !normalizedPlans.some((existing) => existing.courseId === plan.courseId)
      );

      setPlans([...normalizedPlans, ...missingPlans]);
    } else {
      setPlans(defaultPlans);
    }
  }, [courses, discountRate, student]);

  useEffect(() => {
    if (!student) return;

    localStorage.setItem(planStorageKey(student.id), JSON.stringify(plans));
  }, [plans, student]);

  useEffect(() => {
    if (!student) return;

    localStorage.setItem(historyStorageKey(student.id), JSON.stringify(history));
  }, [history, student]);

  const totalPending = useMemo(
    () =>
      plans.reduce(
        (total, plan) =>
          total + Math.round(plan.monthlyAmountInCents * (1 - plan.discountRate)),
        0
      ),
    [plans]
  );

  const handlePayment = (planId: string) => {
    const targetPlan = plans.find((plan) => plan.id === planId);
    if (!targetPlan) return;

    setProcessingId(planId);

    setTimeout(() => {
      const paidAmount = Math.round(
        targetPlan.monthlyAmountInCents * (1 - targetPlan.discountRate)
      );
      const monthNumber = targetPlan.totalMonths - targetPlan.monthsRemaining + 1;

      const receipt: PaymentReceipt = {
        id: `receipt-${Date.now()}`,
        courseName: targetPlan.courseName,
        paidOn: new Date().toISOString(),
        amountPaidInCents: paidAmount,
        monthNumber,
        transactionId: `TXN-${Math.floor(Math.random() * 1_000_000)}`,
      };

      setHistory((previous) => [...previous, receipt]);

      setPlans((previous) =>
        previous.flatMap((plan) => {
          if (plan.id !== planId) return plan;

          const remaining = Math.max(0, plan.monthsRemaining - 1);
          if (remaining === 0) {
            return [];
          }

          return [
            {
              ...plan,
              monthsRemaining: remaining,
              nextDueDate: addMonths(plan.nextDueDate, 1),
            },
          ];
        })
      );

      setProcessingId(null);
    }, 400);
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

  const activeCurrency = courses[0]?.currency ?? "USD";

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
                    <p className="text-xl font-bold">{plans.length}</p>
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
              {plans.length === 0 ? (
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
                  {plans.map((plan) => {
                    const discountedAmount = Math.round(
                      plan.monthlyAmountInCents * (1 - plan.discountRate)
                    );

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
                                Due by {new Date(plan.nextDueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="gap-2"
                              onClick={() => handlePayment(plan.id)}
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
                            <p className="text-sm text-muted-foreground">{receipt.courseName}</p>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(receipt.amountPaidInCents, activeCurrency)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Month {receipt.monthNumber} • Transaction {receipt.transactionId}
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
