import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClasses } from "@/hooks/useData";
import {
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Settings,
  Plus,
} from "lucide-react";

const user = {
  id: "teacher-1234",
  name: "Teacher 02",
};

interface TeacherClassListProps {
  onSelectClass: (classId: string) => void;
}

export function TeacherClassList({ onSelectClass }: TeacherClassListProps) {
  const { classes, loading } = useClasses();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        Loading your classes...
      </div>
    );
  }

  // Filter classes for the current teacher
  const teacherClasses = classes.filter((cls) => cls.teacher_id === user?.id);

  // Mock content data for each class (in a real app, this would come from an API)
  const getClassContent = (classId: string) => ({
    weeks: [
      { id: "week-1", title: "Week 1: Introduction", materialsCount: 5 },
      { id: "week-2", title: "Week 2: Fundamentals", materialsCount: 3 },
      { id: "week-3", title: "Week 3: Advanced Topics", materialsCount: 4 },
    ],
    materials: {
      videos: Math.floor(Math.random() * 15) + 5,
      documents: Math.floor(Math.random() * 20) + 10,
      quizzes: Math.floor(Math.random() * 8) + 2,
      assignments: Math.floor(Math.random() * 6) + 3,
    },
    recentActivity: [
      {
        type: "video",
        title: "Lecture Recording - Advanced Concepts",
        date: "2 hours ago",
      },
      {
        type: "document",
        title: "Assignment Guidelines.pdf",
        date: "1 day ago",
      },
      { type: "quiz", title: "Mid-term Quiz Created", date: "3 days ago" },
    ],
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between lg:items-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Classes
          </h2>
          <p className="text-lg text-muted-foreground">
            Manage your teaching classes and inspire student success
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{teacherClasses.length} Active Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span>
                {teacherClasses.reduce(
                  (sum, cls) => sum + cls.enrolled_students,
                  0
                )}{" "}
                Total Students
              </span>
            </div>
          </div>
        </div>
        <Button className="h-12 w-full rounded-xl bg-gradient-primary px-6 transition-all duration-300 hover:scale-105 hover:shadow-medium sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Create New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {teacherClasses.map((classItem) => (
          <Card
            key={classItem.id}
            className="group flex h-full flex-col rounded-xl border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-md"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                    {classItem.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {classItem.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              {/* Class Details */}
              <div className="space-y-3">
               <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">
                    {classItem.enrolled_students}/{classItem.max_students}{" "}
                    students
                  </span>
                </div>

                 <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{classItem.schedule}</span>
                </div>

               <div className="flex flex-wrap items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{classItem.room}</span>
                </div>
              </div>

              <Button
                className="h-10 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => onSelectClass(classItem.id)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Content
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {teacherClasses.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-primary/10 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            No Classes Yet
          </h3>
          <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
            Ready to start your teaching journey? Request your first class
            assignment and begin inspiring minds.
          </p>
          <Button className="bg-gradient-primary hover:shadow-medium transition-all duration-300 hover:scale-105 h-12 px-8 rounded-xl">
            <Plus className="w-5 h-5 mr-2" />
            Request Class Assignment
          </Button>
        </div>
      )}
    </div>
  );
}
