"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Calendar, CreditCard, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMonthLabel, formatCurrency as formatCurrencyDisplay } from "@/lib/utils";

interface DuePayment {
  courseId: string;
  courseName: string;
  monthYear: string;
  dueDate: string;
  amountDueInCents: number;
  currency: string;
  isOverdue: boolean;
  daysOverdue: number;
}

interface DuePaymentsResponse {
  duePayments: DuePayment[];
  totalDueCount: number;
  overdueCount: number;
}

export function DuePaymentAlert() {
  const [dueData, setDueData] = useState<DuePaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const fetchDuePayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/due", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as DuePaymentsResponse;
      setDueData(data);
    } catch (error) {
      console.error("Failed to fetch due payments", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDuePayments();
  }, [fetchDuePayments]);

  if (loading || dismissed || !dueData || dueData.totalDueCount === 0) {
    return null;
  }

  const hasOverdue = dueData.overdueCount > 0;
  const totalDue = dueData.duePayments.reduce(
    (sum, p) => sum + p.amountDueInCents,
    0
  );
  const currency = dueData.duePayments[0]?.currency ?? "USD";

  return (
    <Alert
      variant={hasOverdue ? "destructive" : "default"}
      className="relative mb-6"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-bold">
        {hasOverdue ? "Overdue Payment Alert" : "Payment Due"}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          {hasOverdue
            ? `You have ${dueData.overdueCount} overdue payment(s) that require immediate attention.`
            : `You have ${dueData.totalDueCount} payment(s) due this month.`}
        </p>
        <div className="flex flex-wrap gap-2">
          {dueData.duePayments.slice(0, 3).map((payment) => (
            <Badge
              key={`${payment.courseId}-${payment.monthYear}`}
              variant={payment.isOverdue ? "destructive" : "secondary"}
              className="gap-1.5"
            >
              <CreditCard className="h-3 w-3" />
              {payment.courseName}
              <span className="opacity-75">
                ({formatMonthLabel(payment.monthYear)})
              </span>
              <span className="font-bold">
                {formatCurrencyDisplay(payment.amountDueInCents, payment.currency)}
              </span>
              {payment.isOverdue && (
                <span className="text-[10px]">
                  ({payment.daysOverdue}d overdue)
                </span>
              )}
            </Badge>
          ))}
          {dueData.totalDueCount > 3 && (
            <Badge variant="outline">
              +{dueData.totalDueCount - 3} more
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <span className="text-sm font-semibold">
            Total Due: {formatCurrencyDisplay(totalDue, currency)}
          </span>
          <Button size="sm" variant={hasOverdue ? "default" : "secondary"} asChild>
            <a href="/lms?module=payments">
              <Calendar className="mr-2 h-4 w-4" />
              View Payments
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
