"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  User,
  Search,
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  BookOpen,
  Info,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  getEnrolledStudents,
  type EnrolledStudentData,
} from "@/lib/actions/enrolled-students";
import { Pagination } from "./manage-users/Pagination";
import { useDebounce } from "@/hooks/use-debounce";

interface CourseDetailViewProps {
  course: Course;
  onClose: () => void;
}

export function CourseDetailView({ course, onClose }: CourseDetailViewProps) {
  const [students, setStudents] = useState<EnrolledStudentData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(searchTerm, 500);
  const pageSize = 50;

  const fetchEnrolledStudents = async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const result = await getEnrolledStudents({
        courseId: course.id,
        page,
        pageSize,
        searchTerm: search,
      });
      setStudents(result.data);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load enrolled students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    void fetchEnrolledStudents(1, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchEnrolledStudents(currentPage, debouncedSearch);
  }, [currentPage]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted shadow-inner">
            {course.coverImage ? (
              <Image
                src={course.coverImage}
                alt={course.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <BookOpen className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{course.name}</h2>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {course.description}
            </p>
          </div>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={onClose}
          className="rounded-lg bg-primary px-4 text-xs font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Management
        </Button>
      </div>

      <Tabs defaultValue="students" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-[400px] grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="students" className="rounded-lg">
            Enrolled Students
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg">
            Course Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0 flex flex-col gap-6">
          <Card className="border-border/50 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Enrolled Students ({totalCount})
                </CardTitle>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Enrolled At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Loading students...
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.userId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border bg-muted">
                                {student.profileImage ? (
                                  <Image
                                    src={student.profileImage}
                                    alt={student.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">
                                {student.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs font-semibold text-primary">
                              {student.studentPublicId || "-"}
                            </span>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone || "-"}</TableCell>
                          <TableCell className="text-right">
                            {format(
                              new Date(student.enrolledAt),
                              "MMM d, yyyy"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/10">
                    <span className="text-muted-foreground font-semibold">
                      Teacher
                    </span>
                    <span className="font-medium">{course.teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/10">
                    <span className="text-muted-foreground font-semibold">
                      Category
                    </span>
                    <span className="font-medium">
                      {course.courseCategory?.name || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/10">
                    <span className="text-muted-foreground font-semibold">
                      Monthly Price
                    </span>
                    <span className="font-medium">
                      {formatCurrency(course.priceInCents, course.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  About Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
