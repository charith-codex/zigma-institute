import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Video,
  Brain,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  BarChart3,
  ClipboardList,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { WeekNavigation } from "../lms/WeekNavigation";
import { Material, WeekContentView } from "../lms/WeekContentView";
import { Week, WeekManager } from "../lms/WeekManager";
import { StudentManagement } from "./StudentManagement";
import { QuestionAuthoring } from "./QuestionAuthoring";
import { ExamBuilder } from "./ExamBuilder";
import { ExamScheduler } from "./ExamScheduler";
import { ExamResults } from "./ExamResults";
import { useRouter } from "next/navigation";

interface ClassContentManagerProps {
  classId: string;
  loading?: boolean;
  classes?: { id: string; name: string; code: string }[];
}

const navigationItems = [
  { id: "weeks", label: "Weekly Content", icon: BookOpen },
  { id: "recordings", label: "Class Recordings", icon: Video },
  { id: "students", label: "Students", icon: Users },
  { id: "quizzes", label: "Question Bank", icon: ClipboardList },
  { id: "exams", label: "Exam Papers", icon: FileText },
  { id: "exam-sessions", label: "Exam Sessions", icon: Target },
  { id: "exam-results", label: "Exam Results", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai-tools", label: "AI Tools", icon: Brain },
];

export function ClassContentManager({
  classId,
  loading = false,
  classes = [],
}: ClassContentManagerProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("weeks");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  // Week-wise data management
  const [weeks, setWeeks] = useState<Week[]>([
    {
      id: "week-1",
      title: "Week 1: Introduction to React",
      description: "Basic concepts of React, JSX, and components",
      startDate: "2024-01-15",
      endDate: "2024-01-21",
      order: 1,
      isActive: true,
      materialCount: 3,
    },
    {
      id: "week-2",
      title: "Week 2: State and Props",
      description: "Understanding state management and prop passing",
      startDate: "2024-01-22",
      endDate: "2024-01-28",
      order: 2,
      isActive: true,
      materialCount: 2,
    },
  ]);

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: "mat-001",
      title: "Introduction to React Hooks",
      type: "document",
      weekId: "week-1",
      uploadDate: "2024-01-15",
      size: "2.5 MB",
      downloads: 45,
    },
    {
      id: "mat-002",
      title: "Component Lifecycle Lecture",
      type: "video",
      weekId: "week-1",
      uploadDate: "2024-01-14",
      size: "125 MB",
      views: 38,
    },
    {
      id: "mat-003",
      title: "React Quiz - Week 1",
      type: "quiz",
      weekId: "week-1",
      uploadDate: "2024-01-13",
      questions: 15,
      submissions: 22,
    },
    {
      id: "mat-004",
      title: "State Management Tutorial",
      type: "document",
      weekId: "week-2",
      uploadDate: "2024-01-22",
      size: "1.8 MB",
      downloads: 32,
    },
    {
      id: "mat-005",
      title: "Props Deep Dive Video",
      type: "video",
      weekId: "week-2",
      uploadDate: "2024-01-23",
      size: "89 MB",
      views: 28,
    },
  ]);

  // Update material count when materials change
  const updateWeekMaterialCounts = (updatedMaterials: Material[]) => {
    const updatedWeeks = weeks.map((week) => ({
      ...week,
      materialCount: updatedMaterials.filter((m) => m.weekId === week.id)
        .length,
    }));
    setWeeks(updatedWeeks);
  };

  const handleMaterialsChange = (updatedMaterials: Material[]) => {
    setMaterials(updatedMaterials);
    updateWeekMaterialCounts(updatedMaterials);
  };

  const handleWeeksChange = (updatedWeeks: Week[]) => {
    setWeeks(updatedWeeks);
  };

  console.log("ClassContentManager - classId:", classId);
  console.log("ClassContentManager - classes:", classes);

  const classItem = classes.find((cls) => cls.id === classId);
  console.log("ClassContentManager - classItem:", classItem);

  const handleFileUpload = () => {
    toast.success("File uploaded successfully!");
    setUploadDialogOpen(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "quiz":
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "weeks":
        return (
          <div className="flex h-full">
            <div className="w-80 border-r border-border/50 bg-card/30">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold">Course Weeks</h3>
              </div>
              <WeekNavigation
                weeks={weeks}
                selectedWeek={selectedWeek}
                onSelectWeek={setSelectedWeek}
              />
            </div>
            <div className="flex-1 p-6">
              {selectedWeek ? (
                <WeekContentView
                  selectedWeek={
                    weeks.find((w) => w.id === selectedWeek) || null
                  }
                  materials={materials}
                  onMaterialsChange={handleMaterialsChange}
                />
              ) : (
                <WeekManager
                  weeks={weeks}
                  onWeeksChange={handleWeeksChange}
                  onSelectWeek={setSelectedWeek}
                  selectedWeek={selectedWeek}
                />
              )}
            </div>
          </div>
        );

      case "recordings":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Class Recordings</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Recording
              </Button>
            </div>

            <div className="grid gap-4">
              {materials
                .filter((m) => m.type === "video")
                .map((recording) => (
                  <Card
                    key={recording.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{recording.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Recorded: {recording.uploadDate}</span>
                            <span>Size: {recording.size}</span>
                            <span>Views: {recording.views}</span>
                            <Badge variant="outline" className="text-xs">
                              {weeks.find((w) => w.id === recording.weekId)
                                ?.title || "No week"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        );

      case "students":
        return <StudentManagement classId={classId} />;

      case "quizzes":
        return <QuestionAuthoring />;

      case "exams":
        return <ExamBuilder />;

      case "exam-sessions":
        return <ExamScheduler classId={classId} />;

      case "exam-results":
        return <ExamResults classId={classId} />;

      case "analytics":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Analytics</h3>
            </div>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold mb-2">Class Analytics</h4>
              <p className="text-muted-foreground">
                View detailed analytics and insights about your class
                performance.
              </p>
            </div>
          </div>
        );

      case "ai-tools":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Tools</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h4 className="font-semibold mb-2">Content Generator</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate study materials and lesson plans using AI
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <h4 className="font-semibold mb-2">Quiz Builder</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate quizzes from your content
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading Class...</h3>
          <p className="text-muted-foreground">
            Please wait while we load the class content
          </p>
        </div>
      </div>
    );
  }

  // Handle class not found case
  if (!classItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Class Not Found
          </h3>
          <p className="text-muted-foreground">
            Looking for class ID: {classId}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Available classes: {classes.map((c) => c.id).join(", ")}
          </p>
        </div>
        <Button onClick={() => router.push("/lms-cms")}>Back to Classes</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Left Sidebar */}
      <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border/50 p-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/lms-cms")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
          <div>
            <h2 className="text-lg font-bold">{classItem.name}</h2>
            <p className="text-sm text-muted-foreground">{classItem.code}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-12 rounded-xl transition-all duration-300 ${
                activeSection === item.id
                  ? "bg-gradient-primary text-white shadow-medium"
                  : "hover:bg-primary/5 hover:shadow-soft"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon
                className={`w-4 h-4 mr-3 ${
                  activeSection === item.id ? "text-white" : "text-primary"
                }`}
              />
              <span
                className={`font-medium ${
                  activeSection === item.id ? "text-white" : ""
                }`}
              >
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeSection === "weeks" ? (
          renderContent()
        ) : (
          <div className="p-8">{renderContent()}</div>
        )}
      </div>
    </div>
  );
}
