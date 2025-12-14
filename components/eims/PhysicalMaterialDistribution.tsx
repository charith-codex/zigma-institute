import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useClasses, type ClassSummary } from "@/hooks/useData";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface CourseStudent {
  id: string;
  name: string;
}

const fallbackCourses: ClassSummary[] = [
  {
    id: "CLS-FALLBACK-1",
    name: "Mathematics Advanced",
    code: "MATH-ADV",
    description: "Mathematics course placeholder",
    teacher_id: null,
    teacher_name: null,
    enrolled_students: 24,
    max_students: 30,
    schedule: "Mon & Wed",
    room: "Room 101",
    semester: "Semester 1",
    status: "active",
    department: "Mathematics",
    coverImage: null,
    slug: "mathematics-advanced",
  },
  {
    id: "CLS-FALLBACK-2",
    name: "Physics Foundation",
    code: "PHYS-FND",
    description: "Physics course placeholder",
    teacher_id: null,
    teacher_name: null,
    enrolled_students: 18,
    max_students: 28,
    schedule: "Tue & Thu",
    room: "Room 202",
    semester: "Semester 1",
    status: "active",
    department: "Science",
    coverImage: null,
    slug: "physics-foundation",
  },
];

const courseStudentsDirectory: Record<string, CourseStudent[]> = {
  "CLS-FALLBACK-1": [
    { id: "STU-101", name: "Alice Carter" },
    { id: "STU-102", name: "Benjamin Lee" },
    { id: "STU-103", name: "Clara Singh" },
    { id: "STU-104", name: "Daniel Moore" },
    { id: "STU-105", name: "Emma Rodriguez" },
    { id: "STU-106", name: "Felix Nguyen" },
  ],
  "CLS-FALLBACK-2": [
    { id: "STU-201", name: "Grace Patel" },
    { id: "STU-202", name: "Henry Kim" },
    { id: "STU-203", name: "Isabella Wright" },
    { id: "STU-204", name: "Jack Thompson" },
    { id: "STU-205", name: "Katherine Brown" },
    { id: "STU-206", name: "Leo Martinez" },
  ],
};

const createDistributionKey = (
  courseId: string,
  tuteName: string,
  studentId: string
): string => `${courseId}::${tuteName.trim().toLowerCase()}::${studentId}`;

export function PhysicalMaterialDistribution() {
  const { classes, loading } = useClasses();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [tuteName, setTuteName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [distributionMap, setDistributionMap] = useState<Record<string, boolean>>({});

  const availableCourses = useMemo<ClassSummary[]>(
    () => (classes.length > 0 ? classes : fallbackCourses),
    [classes]
  );

  const activeCourse = availableCourses.find(
    (course) => course.id === selectedCourse
  );

  const activeCourseStudents = useMemo<CourseStudent[]>(() => {
    if (!selectedCourse) {
      return [];
    }

    if (courseStudentsDirectory[selectedCourse]) {
      return courseStudentsDirectory[selectedCourse];
    }

    const fallbackLabel = activeCourse?.name ?? "Course";
    const sampleNames = [
      "Alex", "Blake", "Casey", "Dakota", "Elliot", "Frankie", "Georgie",
    ];

    return sampleNames.map((name, index) => ({
      id: `${selectedCourse}-${index + 1}`,
      name: `${name} (${fallbackLabel})`,
    }));
  }, [activeCourse?.name, selectedCourse]);

  const filteredStudents = useMemo<CourseStudent[]>(() => {
    if (searchTerm.trim().length === 0) {
      return activeCourseStudents;
    }

    const normalized = searchTerm.trim().toLowerCase();

    return activeCourseStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(normalized) ||
        student.id.toLowerCase().includes(normalized)
    );
  }, [activeCourseStudents, searchTerm]);

  const totalDistributedForCourse = useMemo<number>(() => {
    if (!selectedCourse || tuteName.trim().length === 0) {
      return 0;
    }

    const keyPrefix = `${selectedCourse}::${tuteName.trim().toLowerCase()}::`;

    return Object.entries(distributionMap).filter(
      ([key, isDistributed]) => key.startsWith(keyPrefix) && isDistributed
    ).length;
  }, [distributionMap, selectedCourse, tuteName]);

  const handleDistributionChange = (
    studentId: string,
    distributed: boolean
  ) => {
    if (!selectedCourse) {
      toast.error("Select a course before marking distribution.");
      return;
    }

    if (tuteName.trim().length === 0) {
      toast.error("Add the tute name before marking distribution.");
      return;
    }

    const distributionKey = createDistributionKey(
      selectedCourse,
      tuteName,
      studentId
    );

    setDistributionMap((previous) => ({
      ...previous,
      [distributionKey]: distributed,
    }));

    toast.success(
      distributed
        ? `${tuteName} marked as distributed to ${studentId}.`
        : `${tuteName} marked as pending for ${studentId}.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Physical Material Distribution</h1>
          <p className="text-muted-foreground text-sm">
            Select a course, add the tute name, and mark which students received it.
          </p>
        </div>
        {selectedCourse && tuteName.trim().length > 0 ? (
          <Badge variant="secondary" className="text-sm">
            {totalDistributedForCourse} marked as distributed
          </Badge>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribute a Tute</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(courseId) => setSelectedCourse(courseId)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading courses..." : "Choose a course"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Add Tute Name</Label>
              <Input
                value={tuteName}
                onChange={(event) => setTuteName(event.target.value)}
                placeholder="e.g. Algebra Tute"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Search Students</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or student ID"
                className="pl-8"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {activeCourse?.name ?? "Select a course to load students"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedCourse
                    ? `${activeCourseStudents.length} enrolled students`
                    : "Course selection is required"}
                </p>
              </div>
              {tuteName.trim().length > 0 ? (
                <Badge variant="outline" className="text-xs">
                  Tute: {tuteName.trim()}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-2 rounded-md border p-4">
              {selectedCourse ? (
                filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const isDistributed = distributionMap[
                      createDistributionKey(selectedCourse, tuteName, student.id)
                    ] ?? false;

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Distributed</span>
                          <Switch
                            checked={isDistributed}
                            onCheckedChange={(checked) =>
                              handleDistributionChange(student.id, checked)
                            }
                            disabled={tuteName.trim().length === 0}
                            aria-label={`Mark ${tuteName || "tute"} as distributed to ${student.name}`}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No students match your search.
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a course to load enrolled students.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
