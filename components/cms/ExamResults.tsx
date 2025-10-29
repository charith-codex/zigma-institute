import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  TrendingUp, 
  Trophy, 
  AlertCircle,
  BarChart3,
  Download,
  Upload
} from "lucide-react";
import { toast } from "sonner";

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  marks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  submissionDate: string;
  remarks?: string;
  status: 'graded' | 'pending' | 'submitted';
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  totalMarks: number;
  duration: string;
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  status: 'scheduled' | 'completed' | 'grading';
}

interface ExamResultsProps {
  classId: string;
}

export function ExamResults({ classId }: ExamResultsProps) {
  const [activeTab, setActiveTab] = useState<'exams' | 'results' | 'analytics'>('exams');
  const [addExamDialog, setAddExamDialog] = useState(false);
  const [addResultDialog, setAddResultDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>('');

  // Mock data - replace with real data from your backend
  const [exams, setExams] = useState<Exam[]>([
    {
      id: 'exam-001',
      title: 'Midterm Examination - React Fundamentals',
      date: '2024-01-20',
      totalMarks: 100,
      duration: '2 hours',
      type: 'midterm',
      status: 'completed'
    },
    {
      id: 'exam-002',
      title: 'Final Project Assessment',
      date: '2024-02-15',
      totalMarks: 150,
      duration: '3 hours',
      type: 'final',
      status: 'grading'
    },
    {
      id: 'exam-003',
      title: 'Weekly Quiz - State Management',
      date: '2024-01-25',
      totalMarks: 50,
      duration: '1 hour',
      type: 'quiz',
      status: 'scheduled'
    }
  ]);

  const [examResults, setExamResults] = useState<ExamResult[]>([
    {
      id: 'result-001',
      examId: 'exam-001',
      examTitle: 'Midterm Examination - React Fundamentals',
      studentId: 'student-001',
      studentName: 'John Doe',
      marks: 85,
      totalMarks: 100,
      percentage: 85,
      grade: 'A',
      submissionDate: '2024-01-20',
      status: 'graded',
      remarks: 'Excellent understanding of concepts'
    },
    {
      id: 'result-002',
      examId: 'exam-001',
      examTitle: 'Midterm Examination - React Fundamentals',
      studentId: 'student-002',
      studentName: 'Jane Smith',
      marks: 92,
      totalMarks: 100,
      percentage: 92,
      grade: 'A+',
      submissionDate: '2024-01-20',
      status: 'graded',
      remarks: 'Outstanding performance'
    },
    {
      id: 'result-003',
      examId: 'exam-001',
      examTitle: 'Midterm Examination - React Fundamentals',
      studentId: 'student-003',
      studentName: 'Mike Johnson',
      marks: 78,
      totalMarks: 100,
      percentage: 78,
      grade: 'B+',
      submissionDate: '2024-01-20',
      status: 'graded'
    }
  ]);

  const [newExam, setNewExam] = useState({
    title: '',
    date: '',
    totalMarks: '',
    duration: '',
    type: 'midterm' as Exam['type']
  });

  const [newResult, setNewResult] = useState({
    examId: '',
    studentName: '',
    marks: '',
    remarks: ''
  });

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  const getStatusColor = (status: Exam['status'] | ExamResult['status']) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return 'bg-success/10 text-success border-success/20';
      case 'grading':
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'scheduled':
      case 'submitted':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleAddExam = () => {
    if (!newExam.title || !newExam.date || !newExam.totalMarks || !newExam.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    const exam: Exam = {
      id: `exam-${Date.now()}`,
      title: newExam.title,
      date: newExam.date,
      totalMarks: parseInt(newExam.totalMarks),
      duration: newExam.duration,
      type: newExam.type,
      status: 'scheduled'
    };

    setExams([...exams, exam]);
    setNewExam({ title: '', date: '', totalMarks: '', duration: '', type: 'midterm' });
    setAddExamDialog(false);
    toast.success('Exam added successfully!');
  };

  const handleAddResult = () => {
    if (!newResult.examId || !newResult.studentName || !newResult.marks) {
      toast.error('Please fill in all required fields');
      return;
    }

    const exam = exams.find(e => e.id === newResult.examId);
    if (!exam) {
      toast.error('Selected exam not found');
      return;
    }

    const marks = parseInt(newResult.marks);
    const percentage = Math.round((marks / exam.totalMarks) * 100);

    const result: ExamResult = {
      id: `result-${Date.now()}`,
      examId: newResult.examId,
      examTitle: exam.title,
      studentId: `student-${Date.now()}`,
      studentName: newResult.studentName,
      marks,
      totalMarks: exam.totalMarks,
      percentage,
      grade: getGrade(percentage),
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'graded',
      remarks: newResult.remarks
    };

    setExamResults([...examResults, result]);
    setNewResult({ examId: '', studentName: '', marks: '', remarks: '' });
    setAddResultDialog(false);
    toast.success('Exam result added successfully!');
  };

  const getClassStatistics = () => {
    const totalStudents = examResults.length;
    const averageMarks = totalStudents > 0 
      ? Math.round(examResults.reduce((sum, result) => sum + result.percentage, 0) / totalStudents)
      : 0;
    const passedStudents = examResults.filter(result => result.percentage >= 50).length;
    const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;

    return { totalStudents, averageMarks, passedStudents, passRate };
  };

  const statistics = getClassStatistics();

  const renderExamsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Physical Exams</h3>
        <Dialog open={addExamDialog} onOpenChange={setAddExamDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="examTitle">Exam Title</Label>
                <Input
                  id="examTitle"
                  placeholder="Enter exam title..."
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 hours"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    placeholder="100"
                    value={newExam.totalMarks}
                    onChange={(e) => setNewExam({ ...newExam, totalMarks: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select value={newExam.type} onValueChange={(value: Exam['type']) => 
                    setNewExam({ ...newExam, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddExam} className="flex-1">
                  Add Exam
                </Button>
                <Button variant="outline" onClick={() => setAddExamDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{exam.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Date: {exam.date}</span>
                      <span>Duration: {exam.duration}</span>
                      <span>Total Marks: {exam.totalMarks}</span>
                      <Badge variant="outline" className={getStatusColor(exam.status)}>
                        {exam.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedExam(exam.id);
                      setActiveTab('results');
                    }}
                  >
                    View Results
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

  const renderResults = () => {
    const filteredResults = selectedExam 
      ? examResults.filter(result => result.examId === selectedExam)
      : examResults;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Exam Results</h3>
            {selectedExam && (
              <p className="text-sm text-muted-foreground">
                Showing results for: {exams.find(e => e.id === selectedExam)?.title}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by exam..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Exams</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={addResultDialog} onOpenChange={setAddResultDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Result
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exam Result</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="examSelect">Select Exam</Label>
                    <Select value={newResult.examId} onValueChange={(value) => 
                      setNewResult({ ...newResult, examId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an exam..." />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.title} ({exam.totalMarks} marks)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      placeholder="Enter student name..."
                      value={newResult.studentName}
                      onChange={(e) => setNewResult({ ...newResult, studentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marks">Marks Obtained</Label>
                    <Input
                      id="marks"
                      type="number"
                      placeholder="Enter marks..."
                      value={newResult.marks}
                      onChange={(e) => setNewResult({ ...newResult, marks: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Add any remarks..."
                      value={newResult.remarks}
                      onChange={(e) => setNewResult({ ...newResult, remarks: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddResult} className="flex-1">
                      Add Result
                    </Button>
                    <Button variant="outline" onClick={() => setAddResultDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.studentName}</TableCell>
                    <TableCell className="max-w-xs truncate">{result.examTitle}</TableCell>
                    <TableCell>{result.marks}/{result.totalMarks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{result.percentage}%</span>
                        {result.percentage >= 85 && <Trophy className="w-4 h-4 text-warning" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        result.grade.startsWith('A') ? 'bg-success/10 text-success border-success/20' :
                        result.grade.startsWith('B') ? 'bg-primary/10 text-primary border-primary/20' :
                        result.grade.startsWith('C') ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }>
                        {result.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Performance Analytics</h3>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-xl font-bold">{exams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class Average</p>
                <p className="text-xl font-bold">{statistics.averageMarks}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-xl font-bold">{statistics.passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-xl font-bold">{statistics.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold mb-2">Detailed Analytics Coming Soon</h4>
              <p className="text-muted-foreground">
                View comprehensive performance charts, grade distributions, and student progress tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Physical Exam Results</h2>
          <p className="text-muted-foreground">Manage exam papers and track student performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Results
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === 'exams' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('exams')}
          className="px-4"
        >
          <FileText className="w-4 h-4 mr-2" />
          Exams
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('results')}
          className="px-4"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Results
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('analytics')}
          className="px-4"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'exams' && renderExamsList()}
      {activeTab === 'results' && renderResults()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
}