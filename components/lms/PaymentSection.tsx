import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Percent,
} from "lucide-react";
import { useCourses } from "@/hooks/useData";
import type { Course } from "@/types";

const PLAN_STORAGE_KEY = "lms-course-payment-plans";
const HISTORY_STORAGE_KEY = "lms-course-payment-history";
const MINIMUM_MONTHLY_CENTS = 2500;

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

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
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

const computeDuration = (course: Course) =>
  Math.min(12, Math.max(4, Math.round(course.name.length / 5)));

const fallbackDate = new Date();
const FALLBACK_COURSES: Course[] = [
  {
    id: "mock-course-1",
    name: "Foundations of Programming",
    slug: "foundations-programming",
    coverImage: "/placeholder.svg",
    description: "Core programming principles with monthly guided projects.",
    teacherId: "teacher-mock-1",
    teacherName: "Instructor",
    priceInCents: 45000,
    currency: "USD",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: "mock-course-2",
    name: "Business Analytics Essentials",
    slug: "business-analytics-essentials",
    coverImage: "/placeholder.svg",
    description: "Learn dashboards, data storytelling, and stakeholder reports.",
    teacherId: "teacher-mock-2",
    teacherName: "Instructor",
    priceInCents: 38000,
    currency: "USD",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: "mock-course-3",
    name: "Cloud Infrastructure Basics",
    slug: "cloud-infrastructure-basics",
    coverImage: "/placeholder.svg",
    description: "Deploy resilient services with hands-on cloud labs.",
    teacherId: "teacher-mock-3",
    teacherName: "Instructor",
    priceInCents: 52000,
    currency: "USD",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

export const PaymentSection = () => {
  const { courses } = useCourses();
  const resolvedCourses = useMemo(
    () => (courses.length > 0 ? courses : FALLBACK_COURSES),
    [courses]
  );
  const discountRate = useMemo(
    () => calculateDiscountRate(resolvedCourses.length),
    [resolvedCourses.length]
  );

  const [plans, setPlans] = useState<CoursePaymentPlan[]>([]);
  const [history, setHistory] = useState<PaymentReceipt[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const defaultPlans = useMemo(() => {
    return resolvedCourses.map((course, index) => {
      const duration = computeDuration(course);
      const offsetDate = addMonths(new Date(), index % 2 === 0 ? 0 : 1);

      return {
        id: `plan-${course.id}`,
        courseId: course.id,
        courseName: course.name,
        monthlyAmountInCents: Math.max(course.priceInCents, MINIMUM_MONTHLY_CENTS),
        discountRate,
        monthsRemaining: duration,
        totalMonths: duration,
        nextDueDate: offsetDate,
      } satisfies CoursePaymentPlan;
    });
  }, [discountRate, resolvedCourses]);

  useEffect(() => {
    const storedPlans = localStorage.getItem(PLAN_STORAGE_KEY);
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (storedPlans) {
      const parsed: CoursePaymentPlan[] = JSON.parse(storedPlans);
      setPlans(parsed.map((plan) => ({ ...plan, discountRate })));
    } else {
      setPlans(defaultPlans);
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, [defaultPlans, discountRate]);

  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-muted-foreground">
            Pay monthly installments until each course ends. Discounts apply when you
            subscribe to multiple courses in the same period.
          </p>
        </div>
        {discountRate > 0 && (
          <Badge variant="secondary" className="gap-2 px-3 py-1">
            <Percent className="h-4 w-4" />
            {Math.round(discountRate * 100)}% bundle discount active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Due This Month</p>
                <p className="text-xl font-bold">{formatCurrency(totalPending)}</p>
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
                            {formatCurrency(discountedAmount)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (from {formatCurrency(plan.monthlyAmountInCents)})
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
                            : `Pay ${formatCurrency(discountedAmount)}`}
                        </Button>
                        <Badge variant="secondary" className="gap-2">
                          <Clock className="h-3 w-3" />
                          Month {plan.totalMonths - plan.monthsRemaining + 1} of {" "}
                          {plan.totalMonths}
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
                          {formatCurrency(receipt.amountPaidInCents)}
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
    </div>
  );
};
