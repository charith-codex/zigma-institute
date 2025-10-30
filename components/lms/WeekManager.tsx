import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export interface Week {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  order: number;
  isActive: boolean;
  materialCount: number;
}

interface WeekManagerProps {
  weeks: Week[];
  onWeeksChange: (weeks: Week[]) => void;
  onSelectWeek: (weekId: string) => void;
  selectedWeek?: string;
}

export function WeekManager({ weeks, onWeeksChange, onSelectWeek, selectedWeek }: WeekManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Week title is required');
      return;
    }

    if (editingWeek) {
      // Update existing week
      const updatedWeeks = weeks.map(week => 
        week.id === editingWeek.id 
          ? { ...week, ...formData }
          : week
      );
      onWeeksChange(updatedWeeks);
      toast.success('Week updated successfully');
    } else {
      // Create new week
      const newWeek: Week = {
        id: `week-${Date.now()}`,
        ...formData,
        order: weeks.length + 1,
        isActive: true,
        materialCount: 0
      };
      onWeeksChange([...weeks, newWeek]);
      toast.success('Week created successfully');
    }

    setDialogOpen(false);
    setEditingWeek(null);
    setFormData({ title: '', description: '', startDate: '', endDate: '' });
  };

  const handleEdit = (week: Week) => {
    setEditingWeek(week);
    setFormData({
      title: week.title,
      description: week.description,
      startDate: week.startDate,
      endDate: week.endDate
    });
    setDialogOpen(true);
  };

  const handleDelete = (weekId: string) => {
    const updatedWeeks = weeks.filter(week => week.id !== weekId);
    onWeeksChange(updatedWeeks);
    toast.success('Week deleted successfully');
  };

  const openCreateDialog = () => {
    setEditingWeek(null);
    setFormData({ title: '', description: '', startDate: '', endDate: '' });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Week Management</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create Week
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWeek ? 'Edit Week' : 'Create New Week'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Week Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Week 1: Introduction to React"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the week's content..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingWeek ? 'Update Week' : 'Create Week'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {weeks.map((week) => (
          <Card 
            key={week.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedWeek === week.id ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => onSelectWeek(week.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {week.title}
                    {selectedWeek === week.id && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{week.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(week);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(week.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {week.startDate} - {week.endDate}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {week.materialCount} materials
                  </Badge>
                </div>
                <Badge variant={week.isActive ? "default" : "secondary"}>
                  Week {week.order}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {weeks.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">No weeks created yet</h4>
              <p className="text-muted-foreground mb-4">
                Create your first week to start organizing course materials
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Week
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}