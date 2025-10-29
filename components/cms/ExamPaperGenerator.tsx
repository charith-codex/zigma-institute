import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Brain,
  Clock,
  FileText,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
  marks: number;
  options?: string[];
  correctAnswer?: string;
  instructions?: string;
}

interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  questions: ExamQuestion[];
  isPublished: boolean;
  createdAt: string;
  examDate?: string;
}

interface ExamPaperGeneratorProps {
  classId?: string;
}

export const ExamPaperGenerator = ({ classId }: ExamPaperGeneratorProps = {}) => {
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([
    {
      id: "1",
      title: "Mid-term Examination",
      subject: "Computer Science",
      duration: 180,
      totalMarks: 100,
      instructions: "Answer all questions. Write clearly and legibly.",
      questions: [
        {
          id: "q1",
          question: "Explain the concept of Object-Oriented Programming with examples.",
          type: "essay",
          marks: 20,
          instructions: "Minimum 500 words required"
        },
        {
          id: "q2",
          question: "What is the time complexity of binary search?",
          type: "multiple-choice",
          marks: 5,
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correctAnswer: "O(log n)"
        }
      ],
      isPublished: true,
      createdAt: "2024-01-15",
      examDate: "2024-02-15"
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPaper, setEditingPaper] = useState<ExamPaper | null>(null);
  const [newPaper, setNewPaper] = useState({
    title: "",
    subject: "",
    duration: 180,
    totalMarks: 100,
    instructions: "",
    examDate: ""
  });

  const generateAIExam = async (subject: string, level: string, duration: number, marks: number) => {
    toast.info("Generating AI exam paper...");
    
    // Simulate AI exam generation
    setTimeout(() => {
      const aiPaper: ExamPaper = {
        id: Date.now().toString(),
        title: `AI Generated: ${subject} Exam`,
        subject: subject,
        duration: duration,
        totalMarks: marks,
        instructions: "Read all questions carefully before answering. Time management is crucial.",
        questions: [
          {
            id: "ai-q1",
            question: `Explain the fundamental concepts of ${subject} with practical examples.`,
            type: "essay",
            marks: Math.floor(marks * 0.3),
            instructions: "Minimum 800 words required. Include diagrams where necessary."
          },
          {
            id: "ai-q2",
            question: `What are the key principles in ${subject}?`,
            type: "short-answer",
            marks: Math.floor(marks * 0.2),
            instructions: "Answer in 200-300 words"
          },
          {
            id: "ai-q3",
            question: `Which of the following is correct about ${subject}?`,
            type: "multiple-choice",
            marks: Math.floor(marks * 0.1),
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A"
          }
        ],
        isPublished: false,
        createdAt: new Date().toISOString().split('T')[0],
        examDate: ""
      };
      
      setExamPapers(prev => [...prev, aiPaper]);
      toast.success("AI exam paper generated successfully!");
    }, 3000);
  };

  const createExamPaper = () => {
    if (!newPaper.title.trim() || !newPaper.subject.trim()) {
      toast.error("Title and subject are required");
      return;
    }

    const paper: ExamPaper = {
      id: Date.now().toString(),
      ...newPaper,
      questions: [],
      isPublished: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setExamPapers(prev => [...prev, paper]);
    setNewPaper({ title: "", subject: "", duration: 180, totalMarks: 100, instructions: "", examDate: "" });
    setShowCreateDialog(false);
    toast.success("Exam paper created successfully!");
  };

  const deleteExamPaper = (id: string) => {
    setExamPapers(prev => prev.filter(p => p.id !== id));
    toast.success("Exam paper deleted successfully!");
  };

  const togglePublish = (id: string) => {
    setExamPapers(prev => prev.map(p => 
      p.id === id ? { ...p, isPublished: !p.isPublished } : p
    ));
    toast.success("Exam paper status updated!");
  };

  const downloadPaper = (paper: ExamPaper) => {
    // In a real app, this would generate and download a PDF
    toast.success(`Downloading ${paper.title}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Exam Paper Generator</h2>
          <p className="text-muted-foreground">Create and manage examination papers</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Brain className="w-4 h-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate AI Exam Paper</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Computer Science" />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" defaultValue="180" />
                  </div>
                  <div>
                    <Label htmlFor="marks">Total Marks</Label>
                    <Input id="marks" type="number" defaultValue="100" />
                  </div>
                </div>
                <Button 
                  onClick={() => generateAIExam("Computer Science", "advanced", 180, 100)}
                  className="w-full"
                >
                  Generate Exam Paper
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Paper
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Exam Paper</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={newPaper.title}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Mid-term Examination"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newPaper.subject}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newPaper.duration}
                      onChange={(e) => setNewPaper(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={newPaper.totalMarks}
                      onChange={(e) => setNewPaper(prev => ({ ...prev, totalMarks: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={newPaper.examDate}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, examDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newPaper.instructions}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Enter exam instructions"
                  />
                </div>
                <Button onClick={createExamPaper} className="w-full">
                  Create Exam Paper
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Exam Papers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {examPapers.map((paper) => (
          <Card key={paper.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{paper.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{paper.subject}</p>
                  {paper.examDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Exam Date: {new Date(paper.examDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant={paper.isPublished ? "default" : "secondary"}>
                  {paper.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{paper.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{paper.totalMarks} marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>{paper.questions.length} questions</span>
                </div>
              </div>

              {paper.instructions && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {paper.instructions}
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-3 h-3 mr-2" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => downloadPaper(paper)}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={paper.isPublished ? "secondary" : "default"}
                  onClick={() => togglePublish(paper.id)}
                  className="flex-1"
                >
                  {paper.isPublished ? (
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
                  onClick={() => deleteExamPaper(paper.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {examPapers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Exam Papers Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first exam paper or generate one using AI
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Exam Paper
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};