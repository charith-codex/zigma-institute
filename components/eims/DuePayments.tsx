"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Clock, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OverdueCourse {
  courseId: string;
  courseName: string;
  amount: number;
}

interface OverdueStudent {
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  studentPublicId: string;
  overdueCourses: OverdueCourse[];
}

export const DuePayments = () => {
  const [students, setStudents] = useState<OverdueStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDuePayments = async () => {
      try {
        const response = await fetch("/api/fees/due");
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Failed to fetch due payments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDuePayments();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentPublicId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOverdueAmount = students.reduce((acc, student) => {
    return (
      acc +
      student.overdueCourses.reduce((sum, course) => sum + course.amount, 0)
    );
  }, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Due Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // If no students and not past 1st week, we might want to show a subtle message
  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-success" />
            Due Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No overdue payments recorded for this month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Due Payments (Current Month)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Students who haven't paid for the current month (Past 1st week).
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground font-semibold">
            Total Overdue
          </p>
          <p className="text-2xl font-bold text-destructive">
            {(totalOverdueAmount / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex items-center gap-2">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student name or ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Public ID</TableHead>
                <TableHead>Overdue Courses</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const studentTotal = student.overdueCourses.reduce(
                    (sum, c) => sum + c.amount,
                    0
                  );
                  return (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {student.studentName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {student.studentEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {student.studentPublicId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.overdueCourses.map((c) => (
                            <Badge key={c.courseId} variant="secondary">
                              {c.courseName}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-destructive">
                        {(studentTotal / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No matching students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
