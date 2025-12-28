"use client";

import React, { useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  ListChecks,
  Users,
  TrendingUp,
  Target,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { format } from "date-fns";
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
import { FlowerLoader } from "../ui/flower-loader";

const CHART_COLORS = [
  "#A41FC5", // Primary
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#6366f1", // Indigo
  "#ec4899", // Pink
];

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
  currency: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
        <p className="mb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-bold text-primary">
          {formatCurrency(payload[0].value as number, currency)}
        </p>
      </div>
    );
  }
  return null;
};

const FeeManagement = () => {
  const { payments, summary, loading, error, refetch } = usePayments();

  const currency = payments[0]?.currency ?? "LKR";

  const thisMonthKey = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;

  const thisMonthIncome = summary?.monthlyIncome.find(
    (item) => item.month === thisMonthKey
  )?.totalInCents;

  const chartData = useMemo(() => {
    if (!summary?.monthlyIncome) return [];
    return summary.monthlyIncome
      .map((item) => ({
        name: formatMonthLabel(item.month),
        amount: item.totalInCents,
        originalMonth: item.month,
      }))
      .sort((a, b) => a.originalMonth.localeCompare(b.originalMonth));
  }, [summary?.monthlyIncome]);

  const pieData = useMemo(() => {
    if (!summary?.courseTotals) return [];
    return summary.courseTotals
      .map((item) => ({
        name: item.courseName,
        value: item.totalInCents,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 courses
  }, [summary?.courseTotals]);

  if (loading) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <FlowerLoader size="md" className="text-[#A41FC5] mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-bold">Failed to load fee data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            className="border-destructive/20 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black">Financial Analytics</h2>
          <p className="text-muted-foreground font-medium">
            Real-time revenue tracking and course performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            LIVE DATA UPDATED
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto md:ml-0"
            onClick={() => void refetch()}
            title="Sync/Refresh Data"
          >
            <ListChecks className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-none shadow-xl text-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {formatCurrency(summary?.totalIncomeInCents ?? 0, currency)}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
              <TrendingUp className="h-3 w-3" />
              LIFETIME EARNINGS
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {formatCurrency(thisMonthIncome ?? 0, currency)}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase">
              Current collection month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Payers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {summary?.studentTotals.length ?? 0}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase">
              Subscribing students
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Courses
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {summary?.courseTotals.length ?? 0}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase">
              Revenue-generating courses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Growth
            </CardTitle>
            <CardDescription className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
              Monthly income trend for the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#888" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#888" }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip currency={currency} />}
                    cursor={{ fill: "#f8f8f8" }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#A41FC5"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 shadow-lg border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Share by Course
            </CardTitle>
            <CardDescription className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
              Revenue distribution (%)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 space-y-2">
              {pieData.slice(0, 4).map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-[11px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="truncate max-w-[120px]">{entry.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(
                      (entry.value / (summary?.totalIncomeInCents || 1)) * 100
                    )}
                    %
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 shadow-lg border-none h-fit">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">
                Transaction History
              </CardTitle>
              <Badge variant="secondary" className="font-bold text-[10px]">
                RECENT 10
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead className="font-black text-[11px] uppercase tracking-wider px-6 py-4">
                    Student
                  </TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-wider px-6 py-4">
                    Details
                  </TableHead>
                  <TableHead className="text-right font-black text-[11px] uppercase tracking-wider px-6 py-4">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-32 text-center text-muted-foreground italic"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.slice(0, 10).map((payment) => (
                    <TableRow
                      key={payment.transactionId ?? payment.id}
                      className="h-20 group border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="font-bold text-sm group-hover:text-primary transition-colors">
                          {payment.studentName}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground leading-tight mt-1">
                          {format(
                            new Date(payment.paidAt),
                            "MMM d, h:mm a"
                          ).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-foreground overflow-hidden text-ellipsis max-w-[200px] whitespace-nowrap">
                            {payment.courseName ?? "Registration"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="font-black text-sm text-primary">
                          {formatCurrency(
                            payment.amountInCents,
                            payment.currency
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          {payments.length > 10 && (
            <div className="p-4 border-t flex justify-center bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold gap-2 text-muted-foreground"
              >
                View All Activity
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-5 shadow-lg border-none h-fit">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-bold">
              Course Revenue Breakdown
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Performance by course category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead className="font-black text-[11px] uppercase tracking-wider px-6 py-4">
                    Course Name
                  </TableHead>
                  <TableHead className="text-center font-black text-[11px] uppercase tracking-wider px-6 py-4">
                    Count
                  </TableHead>
                  <TableHead className="text-right font-black text-[11px] uppercase tracking-wider px-6 py-4">
                    Total Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.courseTotals.length ? (
                  summary.courseTotals.map((course) => (
                    <TableRow
                      key={course.courseId}
                      className="h-16 border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-bold text-xs truncate max-w-[200px] px-6 py-4">
                        {course.courseName}
                      </TableCell>
                      <TableCell className="text-center px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="font-black text-[10px] px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                        >
                          {course.payments}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black text-primary text-sm px-6 py-4">
                        {formatCurrency(course.totalInCents, currency)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No course data.
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
