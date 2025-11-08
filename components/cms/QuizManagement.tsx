import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Brain,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  attempts: number;
  isPublished: boolean;
  createdAt: string;
  responses: number;
}

interface QuizManagementProps {
  courseId?: string;
}

export const QuizManagement = ({ courseId }: QuizManagementProps = {}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: "1",
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics",
      questions: [
        {
          id: "q1",
          question:
            "What is the correct way to declare a variable in JavaScript?",
          type: "multiple-choice",
          options: [
            "var x = 5;",
            "variable x = 5;",
            "v x = 5;",
            "declare x = 5;",
          ],
          correctAnswer: "var x = 5;",
          points: 5,
        },
      ],
      timeLimit: 30,
      attempts: 3,
      isPublished: true,
      createdAt: "2024-01-15",
      responses: 24,
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    attempts: 3,
  });

  const generateAIQuiz = async (
    topic: string,
    difficulty: string,
    questionCount: number
  ) => {
    toast.info("Generating AI quiz...");

    // Simulate AI quiz generation
    setTimeout(() => {
      const aiQuiz: Quiz = {
        id: Date.now().toString(),
        title: `AI Generated: ${topic}`,
        description: `Auto-generated quiz on ${topic} - ${difficulty} level`,
        questions: Array.from({ length: questionCount }, (_, i) => ({
          id: `ai-q-${i + 1}`,
          question: `Sample AI question ${i + 1} about ${topic}`,
          type: "multiple-choice" as const,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          points: 5,
        })),
        timeLimit: questionCount * 2,
        attempts: 3,
        isPublished: false,
        createdAt: new Date().toISOString().split("T")[0],
        responses: 0,
      };

      setQuizzes((prev) => [...prev, aiQuiz]);
      toast.success("AI quiz generated successfully!");
    }, 2000);
  };

  const createQuiz = () => {
    if (!newQuiz.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    const quiz: Quiz = {
      id: Date.now().toString(),
      ...newQuiz,
      questions: [],
      isPublished: false,
      createdAt: new Date().toISOString().split("T")[0],
      responses: 0,
    };

    setQuizzes((prev) => [...prev, quiz]);
    setNewQuiz({ title: "", description: "", timeLimit: 30, attempts: 3 });
    setShowCreateDialog(false);
    toast.success("Quiz created successfully!");
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    toast.success("Quiz deleted successfully!");
  };

  const togglePublish = (id: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isPublished: !q.isPublished } : q))
    );
    toast.success("Quiz status updated!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Quiz Management
          </h2>
          <p className="text-muted-foreground">
            Create, manage, and analyze quizzes
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Brain className="w-4 h-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" placeholder="e.g., React Hooks" />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() =>
                    generateAIQuiz("React Hooks", "intermediate", 10)
                  }
                  className="w-full"
                >
                  Generate Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={newQuiz.title}
                    onChange={(e) =>
                      setNewQuiz((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newQuiz.description}
                    onChange={(e) =>
                      setNewQuiz((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter quiz description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={newQuiz.timeLimit}
                      onChange={(e) =>
                        setNewQuiz((prev) => ({
                          ...prev,
                          timeLimit: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="attempts">Max Attempts</Label>
                    <Input
                      id="attempts"
                      type="number"
                      value={newQuiz.attempts}
                      onChange={(e) =>
                        setNewQuiz((prev) => ({
                          ...prev,
                          attempts: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={createQuiz} className="w-full">
                  Create Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quiz.description}
                  </p>
                </div>
                <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                  {quiz.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{quiz.questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{quiz.timeLimit} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{quiz.responses} responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-muted-foreground" />
                  <span>{quiz.attempts} attempts</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={quiz.isPublished ? "secondary" : "default"}
                  onClick={() => togglePublish(quiz.id)}
                  className="flex-1"
                >
                  {quiz.isPublished ? (
                    <>
                      <AlertCircle className="w-3 h-3 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Quizzes Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quiz or generate one using AI
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
