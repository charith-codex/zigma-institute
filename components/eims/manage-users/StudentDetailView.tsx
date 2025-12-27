"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  ChevronRight,
  Download,
  BookOpen,
  CreditCard,
  Info,
  BadgeCheck,
  History,
  IdCard,
  ArrowLeft,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type StudentRecord } from "@/lib/actions/eims-user-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentDetailViewProps {
  student: StudentRecord;
  onClose?: () => void;
}

export function StudentDetailView({
  student,
  onClose,
}: StudentDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Group payments by course
  const paymentsByCourse = student.enrollments.map((course) => {
    const coursePayments = student.payments.filter(
      (p) => p.courseId === course.id
    );
    const totalPaid = coursePayments.reduce(
      (sum, p) => sum + p.amountInCents,
      0
    );
    return {
      course,
      payments: coursePayments.sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      ),
      totalPaid,
    };
  });

  const generalPayments = student.payments.filter((p) => !p.courseId);

  const handleDownloadIdCard = async () => {
    if (!student.idCardUrl) return;

    try {
      if (student.idCardUrl.startsWith("data:image/svg+xml")) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 980;
          canvas.height = img.height || 580;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `student-id-${student.studentPublicId || "card"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("ID card downloaded as PNG");
          }
        };
        img.src = student.idCardUrl;
      } else {
        const response = await fetch(student.idCardUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `student-id-${student.studentPublicId || "card"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("ID card downloaded successfully");
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download ID card");
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted shadow-inner">
            {student.profileImage ? (
              <Image
                src={student.profileImage}
                alt={student.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <User className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {student.name}
              </h2>
              <Badge
                variant={student.status === "ACTIVE" ? "default" : "secondary"}
                className={
                  student.status === "ACTIVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {student.status}
              </Badge>
            </div>
          </div>
        </div>

        {onClose && (
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="rounded-lg bg-[#A41FC5] hover:bg-[#A41FC5]/90 px-4 text-xs font-medium text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Management
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-[400px] grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="courses" className="rounded-lg">
            Courses
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">
            Payments
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Student Details */}
              <div className="lg:col-span-6 space-y-6">
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Student Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <span className="text-muted-foreground font-bold">
                          Student ID
                        </span>
                        <span className="font-semibold text-[#A41FC5]">
                          {student.studentPublicId || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <span className="text-muted-foreground font-bold">
                          Student Email
                        </span>
                        <span className="font-medium">{student.email}</span>
                      </div>
                      {student.parentEmail && (
                        <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                          <span className="text-muted-foreground font-bold">
                            Parent Email
                          </span>
                          <span className="font-medium">
                            {student.parentEmail}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <span className="text-muted-foreground font-bold">
                          Phone
                        </span>
                        <span className="font-medium">
                          {student.phone || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <span className="text-muted-foreground text-sm font-bold">
                          Address
                        </span>
                        <span className="font-medium text-sm">
                          {student.address || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-1">
                        <span className="text-muted-foreground font-bold">
                          Gender
                        </span>
                        <span className="font-medium capitalize">
                          {student.gender?.toLowerCase() || "-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom Stats Card */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                      Date of Birth
                    </p>
                    <p className="text-sm font-semibold">
                      {student.dob
                        ? format(new Date(student.dob), "MMMM do, yyyy")
                        : "-"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                      Joined Date
                    </p>
                    <p className="text-sm font-semibold">
                      {format(new Date(student.createdAt), "MMMM do, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: ID Card */}
              <div className="lg:col-span-6">
                <Card className="border-border/50 h-full flex flex-col overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <IdCard className="h-5 w-5 text-primary" />
                      Student ID Card
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Digital identity card for attendance and verification.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/30">
                    {student.idCardUrl ? (
                      <div className="w-full relative group">
                        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background shadow-xl">
                          <Image
                            src={student.idCardUrl}
                            alt="Student ID card"
                            width={960}
                            height={560}
                            className="h-auto w-full transform transition duration-500 hover:scale-[1.02]"
                            unoptimized
                          />
                        </div>
                        <div className="mt-8 flex justify-center">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleDownloadIdCard}
                            className="bg-[#A41FC5] hover:bg-[#A41FC5]/90 text-white gap-2 h-12 px-10 rounded-2xl shadow-xl transition-all active:scale-95 text-sm font-bold"
                          >
                            <Download className="h-5 w-5" />
                            Download ID Card
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-muted/50 rounded-2xl border-2 border-dashed w-full max-w-sm">
                        <IdCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-sm font-bold mb-1">No ID Card</h3>
                        <p className="text-xs text-muted-foreground">
                          ID card has not been generated for this student.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <Card className="border-border/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Enrolled Courses
                </CardTitle>
                <CardDescription>
                  Courses the student is currently enrolled in.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                {student.enrollments.length > 0 ? (
                  <div className="divide-y border-t border-b">
                    {student.enrollments.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BadgeCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {course.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Active Enrollment
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-muted/20 rounded-lg mx-6 border-2 border-dashed">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No active enrollments found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <Card className="border-border/50 shadow-none overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  Monthly installments and registration fees organized by
                  course.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {paymentsByCourse.length > 0 ? (
                  <div className="p-4 overflow-x-auto">
                    {(() => {
                      // Generate columns for the last 6 months
                      const now = new Date();
                      const monthsToShow: { month: number; year: number }[] =
                        [];
                      for (let i = 0; i < 6; i++) {
                        const d = new Date(
                          now.getFullYear(),
                          now.getMonth() - i,
                          1
                        );
                        monthsToShow.unshift({
                          month: d.getMonth() + 1,
                          year: d.getFullYear(),
                        });
                      }

                      return (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b-2 hover:bg-transparent">
                              <TableHead className="w-[200px] font-bold text-foreground">
                                Course
                              </TableHead>
                              {monthsToShow.map((m) => (
                                <TableHead
                                  key={`${m.year}-${m.month}`}
                                  className="text-center font-bold text-foreground"
                                >
                                  {format(
                                    new Date(m.year, m.month - 1),
                                    "yyyy MMM"
                                  ).toLowerCase()}
                                </TableHead>
                              ))}
                              <TableHead className="text-right font-bold text-foreground">
                                Total
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentsByCourse.map(
                              ({ course, payments, totalPaid }) => (
                                <TableRow key={course.id} className="h-16">
                                  <TableCell className="font-bold text-primary">
                                    {course.name}
                                  </TableCell>
                                  {monthsToShow.map((m) => {
                                    const payment = payments.find(
                                      (p) =>
                                        p.paidMonth === m.month &&
                                        p.paidYear === m.year
                                    );
                                    return (
                                      <TableCell
                                        key={`${m.year}-${m.month}`}
                                        className="text-center"
                                      >
                                        {payment ? (
                                          <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                                              <Check className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-green-600">
                                              {format(
                                                new Date(payment.paidAt),
                                                "MMM d"
                                              )}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground/30 font-bold">
                                            -
                                          </span>
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className="text-right font-bold">
                                    {(totalPaid / 100).toLocaleString(
                                      undefined,
                                      {
                                        style: "currency",
                                        currency:
                                          payments[0]?.currency ?? "USD",
                                      }
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      );
                    })()}

                    {generalPayments.length > 0 && (
                      <div className="mt-8 space-y-3">
                        <h4 className="font-bold text-sm text-muted-foreground flex items-center gap-2 px-2">
                          <History className="h-4 w-4" />
                          Other Payments (Non-Course)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
                          {generalPayments.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs"
                            >
                              <History className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {(p.amountInCents / 100).toLocaleString(
                                    undefined,
                                    { style: "currency", currency: p.currency }
                                  )}
                                </p>
                                <p className="text-muted-foreground uppercase font-bold text-[10px]">
                                  {format(new Date(p.paidAt), "MMM d, yyyy")}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold"
                              >
                                {p.paymentType.toLowerCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-muted-foreground">
                      No payment transactions recorded.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
