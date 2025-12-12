"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FlowerLoader } from "@/components/ui/flower-loader";
import { Search, Users, Mail, Phone, User } from "lucide-react";
import {
  getEnrolledStudents,
  type EnrolledStudentData,
} from "@/lib/actions/enrolled-students";
import { toast } from "sonner";

interface EnrolledStudentsProps {
  courseId: string;
  courseName: string;
}

export function EnrolledStudents({
  courseId,
  courseName,
}: EnrolledStudentsProps) {
  const [students, setStudents] = useState<EnrolledStudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<
    EnrolledStudentData[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getEnrolledStudents(courseId);
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load enrolled students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.studentPublicId?.toLowerCase().includes(query) ||
        student.phone?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FlowerLoader size="md" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Enrolled Students</h3>
          <p className="text-sm text-muted-foreground">
            Students enrolled in {courseName}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          {students.length} {students.length === 1 ? "Student" : "Students"}
        </Badge>
      </div>

      {students.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, student ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No students enrolled</h4>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              This course does not have any enrolled students yet. Students will
              appear here once they enroll.
            </p>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No results found</h4>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              No students match your search query. Try different keywords.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card
              key={student.userId}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage
                      src={student.profileImage || undefined}
                      alt={student.name}
                    />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate">
                      {student.name}
                    </CardTitle>
                    {student.studentPublicId && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {student.studentPublicId}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{student.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="text-xs">
                    Enrolled {new Date(student.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
