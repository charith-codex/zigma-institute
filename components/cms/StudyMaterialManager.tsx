"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UploadDropzone } from "@/lib/uploadthing";

import { Badge } from "@/components/ui/badge";
import {
  deleteStudyMaterial,
  updateStudyMaterial,
} from "@/lib/actions/study-material";

interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  createdAt: string;
}

interface StudyMaterialManagerProps {
  lessonId?: string;
  lessonTitle?: string;
  readOnly?: boolean;
}

function formatFileSize(size: number | null | undefined) {
  if (!size || size <= 0) {
    return null;
  }

  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let value = size;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getFileExtension(name: string) {
  const lastDotIndex = name.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return null;
  }

  return name.slice(lastDotIndex + 1).toUpperCase();
}

export function StudyMaterialManager({
  lessonId,
  lessonTitle,
  readOnly = false,
}: StudyMaterialManagerProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
  });

  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormState, setEditFormState] = useState({
    title: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingMaterial, setDeletingMaterial] =
    useState<StudyMaterial | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dropzoneInput = useMemo(() => {
    const title = formState.title.trim();
    const description = formState.description.trim();

    if (!title || !lessonId) {
      return undefined;
    }

    return {
      title,
      description: description.length > 0 ? description : undefined,
      lessonId,
    };
  }, [formState.description, formState.title, lessonId]);

  const fetchMaterials = useCallback(
    async (options?: { showLoading?: boolean }) => {
      if (!lessonId) {
        setMaterials([]);
        setIsLoading(false);
        return;
      }

      if (options?.showLoading) {
        setIsLoading(true);
      }

      try {
        const endpoint = `/api/study-materials?lessonId=${encodeURIComponent(
          lessonId
        )}`;
        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch study materials");
        }

        const data = (await response.json()) as StudyMaterial[];
        setMaterials(data);
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch study materials"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [lessonId]
  );

  useEffect(() => {
    void fetchMaterials({ showLoading: true });
  }, [fetchMaterials, lessonId]);

  const resetForm = () => {
    setFormState({ title: "", description: "" });
  };

  const handleDialogChange = (open: boolean) => {
    if (open && !lessonId) {
      toast.error("Select a lesson before uploading materials.");
      return;
    }

    setIsDialogOpen(open);
    if (!open) {
      resetForm();
      setIsUploading(false);
    }
  };

  const handleUploadComplete = async () => {
    toast.success("Study material uploaded successfully.");
    resetForm();
    setIsUploading(false);
    setIsDialogOpen(false);
    await fetchMaterials();
  };

  const handleEditClick = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setEditFormState({
      title: material.title,
      description: material.description ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingMaterial) return;

    if (!editFormState.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsUpdating(true);
      await updateStudyMaterial(editingMaterial.id, {
        title: editFormState.title.trim(),
        description: editFormState.description.trim() || null,
      });
      toast.success("Study material updated successfully");
      setIsEditDialogOpen(false);
      setEditingMaterial(null);
      await fetchMaterials();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update study material");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (material: StudyMaterial) => {
    setDeletingMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;

    try {
      setIsDeleting(true);
      await deleteStudyMaterial(deletingMaterial.id);
      toast.success("Study material deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingMaterial(null);
      await fetchMaterials();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete study material");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error(error);
    toast.error(error.message);
    setIsUploading(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>
            Study Material Library{lessonTitle ? ` • ${lessonTitle}` : ""}
          </CardTitle>
          <CardDescription>
            Upload tutorials, notes, and other resources for quick access
            {lessonTitle ? ` in ${lessonTitle}` : ""}.
          </CardDescription>
        </div>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button disabled={!lessonId}>
                <Upload className="mr-2 h-4 w-4" />
                Upload material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload study material</DialogTitle>
                <DialogDescription>
                  Provide a title and optional description, then drop your file
                  to start the upload.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="material-title">Title</Label>
                  <Input
                    id="material-title"
                    placeholder="e.g. Week 3 tutorial notes"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material-description">Description</Label>
                  <Textarea
                    id="material-description"
                    placeholder="Add a short note about this file (optional)"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                {dropzoneInput ? (
                  <UploadDropzone
                    endpoint="studyMaterialUploader"
                    input={dropzoneInput}
                    onUploadBegin={() => setIsUploading(true)}
                    onClientUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                    appearance={{
                      container:
                        "border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/30",
                      label: "text-sm text-muted-foreground",
                      uploadIcon: "text-primary",
                      button:
                        "bg-primary text-primary-foreground px-3 hover:bg-primary/90",
                    }}
                  />
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-center text-sm text-muted-foreground">
                    Enter a title to enable the uploader.
                  </div>
                )}
                {isUploading && (
                  <p className="text-sm text-muted-foreground">
                    Upload in progress. This dialog will close once the upload
                    completes.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {!lessonId ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
            Select a lesson to view or upload study materials.
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p>No study materials uploaded yet.</p>
            <p>Use the upload button above to add your first resource.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => {
              const formattedSize = formatFileSize(material.fileSize);
              const extension = getFileExtension(material.fileName);

              return (
                <div
                  key={material.id}
                  className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{material.title}</span>
                      {extension && (
                        <Badge variant="secondary" className="uppercase">
                          {extension}
                        </Badge>
                      )}
                    </div>
                    {material.description && (
                      <p className="text-sm text-muted-foreground">
                        {material.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Uploaded {formatDate(material.createdAt)}</span>
                      {formattedSize && <span>{formattedSize}</span>}
                      <span className="truncate">{material.fileName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(material)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(material)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit study material</DialogTitle>
            <DialogDescription>
              Update the title and description of your study material.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-material-title">Title</Label>
              <Input
                id="edit-material-title"
                value={editFormState.title}
                onChange={(event) =>
                  setEditFormState((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-material-description">Description</Label>
              <Textarea
                id="edit-material-description"
                value={editFormState.description}
                onChange={(event) =>
                  setEditFormState((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              study material &quot;{deletingMaterial?.title}&quot; from the
              server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default StudyMaterialManager;
