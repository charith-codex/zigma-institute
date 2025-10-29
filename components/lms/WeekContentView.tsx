import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Video,
  FileText,
  ClipboardList,
  Eye,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Clock,
  Download,
} from "lucide-react";
import { Week } from "./WeekManager";
import { toast } from "sonner";

export interface Material {
  id: string;
  title: string;
  type: "video" | "document" | "quiz" | "exam" | "assignment";
  weekId: string;
  uploadDate: string;
  size?: string;
  views?: number;
  downloads?: number;
  questions?: number;
  submissions?: number;
}

interface WeekContentViewProps {
  selectedWeek: Week | null;
  materials: Material[];
  onMaterialsChange: (materials: Material[]) => void;
}

export function WeekContentView({
  selectedWeek,
  materials,
  onMaterialsChange,
}: WeekContentViewProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "document" as Material["type"],
  });

  const weekMaterials = materials.filter((m) => m.weekId === selectedWeek?.id);

  const getTypeIcon = (type: Material["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "quiz":
        return <ClipboardList className="w-4 h-4" />;
      case "exam":
        return <FileText className="w-4 h-4" />;
      case "assignment":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Material["type"]) => {
    switch (type) {
      case "video":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "quiz":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "exam":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "assignment":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const handleUpload = () => {
    if (!uploadForm.title.trim() || !selectedWeek) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      title: uploadForm.title,
      type: uploadForm.type,
      weekId: selectedWeek.id,
      uploadDate: new Date().toISOString().split("T")[0],
      size: "2.5 MB", // Mock data
      views: 0,
      downloads: 0,
    };

    onMaterialsChange([...materials, newMaterial]);
    toast.success("Material uploaded successfully!");
    setUploadDialogOpen(false);
    setUploadForm({ title: "", type: "document" });
  };

  const handleDelete = (materialId: string) => {
    const updatedMaterials = materials.filter((m) => m.id !== materialId);
    onMaterialsChange(updatedMaterials);
    toast.success("Material deleted successfully");
  };

  if (!selectedWeek) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <BookOpen className="w-16 h-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Select a Week</h3>
          <p className="text-muted-foreground">
            Choose a week from the navigation to view and manage its content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Header */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{selectedWeek.title}</h2>
            <p className="text-white/80 mb-3">{selectedWeek.description}</p>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedWeek.startDate} - {selectedWeek.endDate}
              </span>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {weekMaterials.length} materials
              </Badge>
            </div>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Upload Material to {selectedWeek.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Material Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter material title..."
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="type">Material Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(value: Material["type"]) =>
                      setUploadForm({ ...uploadForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpload} className="flex-1">
                    Upload Material
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Materials Grid */}
      {weekMaterials.length > 0 ? (
        <div className="grid gap-4">
          {weekMaterials.map((material) => (
            <Card
              key={material.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${getTypeColor(material.type)}`}
                  >
                    {getTypeIcon(material.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{material.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">
                        {material.type}
                      </Badge>
                      <span>Uploaded: {material.uploadDate}</span>
                      {material.size && <span>Size: {material.size}</span>}
                      {material.views !== undefined && (
                        <span>Views: {material.views}</span>
                      )}
                      {material.downloads !== undefined && (
                        <span>Downloads: {material.downloads}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold mb-2">No materials yet</h4>
            <p className="text-muted-foreground mb-4">
              Upload your first material to {selectedWeek.title}
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload First Material
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
