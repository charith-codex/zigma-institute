"use client";

import {
  useEffect,
  useMemo,
  useState,
  startTransition,
  useActionState,
  useCallback,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Tag, Trash2, PencilLine } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  createCourseCategory,
  deleteCourseCategory,
  updateCourseCategory,
} from "@/lib/actions/course-category";
import { courseCategorySchema } from "@/lib/validators";
import { useCourseCategories } from "@/hooks/useData";
import type { CourseCategory } from "@/types";
import type { ActionState } from "@/lib/actions/user";

const initialState: ActionState = { success: false, message: "" };

export function CourseCategoryManagement() {
  const { categories, loading, error, refetch } = useCourseCategories();
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CourseCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [formKey, setFormKey] = useState(0); // Add form key for force re-render

  // Memoize sorted categories only when categories array reference changes
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  // Centralized refetch with loading state
  const handleRefetch = useCallback(async () => {
    setIsRefetching(true);
    try {
      await refetch();
      // Add a small delay to ensure backend consistency
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Force form re-render by changing key
      setFormKey((prev) => prev + 1);
    } catch (error) {
      console.error("Refetch error:", error);
      toast.error("Error", {
        description: "Failed to refresh categories",
      });
    } finally {
      setIsRefetching(false);
    }
  }, [refetch]);

  const handleEditClick = useCallback((category: CourseCategory) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogChange = useCallback((open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  }, []);

  const handleDeleteClick = useCallback((category: CourseCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete.id);

    try {
      const formData = new FormData();
      formData.append("id", categoryToDelete.id);

      const result = await deleteCourseCategory(initialState, formData);

      if (result.success) {
        toast.success("Success", {
          description: result.message || "Category deleted successfully",
        });

        // Refetch immediately after successful deletion
        await handleRefetch();
      } else {
        toast.error("Error", {
          description: result.message || "Failed to delete category",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, handleRefetch]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Tag className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Course Categories</h2>
          <p className="text-sm text-muted-foreground">
            Organize courses with reusable categories for easier browsing.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.2fr]">
        <Card className="h-fit border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Add course category</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseCategoryCreateForm key={formKey} onSuccess={handleRefetch} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Existing categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(loading || isRefetching) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isRefetching ? "Refreshing..." : "Loading categories..."}
              </div>
            )}

            {error && !loading && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="overflow-hidden rounded-lg border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Updated
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm">
                        No categories yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCategories.map((category) => {
                      const isDeleting = deletingId === category.id;
                      return (
                        <TableRow
                          key={category.id}
                          className={isDeleting ? "opacity-50" : ""}
                        >
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                            {category.updatedAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditClick(category)}
                              disabled={isDeleting || isRefetching}
                            >
                              <PencilLine className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(category)}
                              disabled={isDeleting || isRefetching}
                            >
                              {isDeleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
            >
              {deletingId !== null && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit course category</DialogTitle>
            <DialogDescription>
              Update the category name used to organize courses.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CourseCategoryEditForm
              category={editingCategory}
              onSuccess={() => {
                handleEditDialogChange(false);
                void handleRefetch();
              }}
              onCancel={() => handleEditDialogChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type CategoryFormValues = {
  name: string;
};

type CourseCategoryCreateFormProps = {
  onSuccess: () => void | Promise<void>;
};

function CourseCategoryCreateForm({
  onSuccess,
}: CourseCategoryCreateFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(courseCategorySchema),
    defaultValues: { name: "" },
  });

  const [state, formAction, pending] = useActionState(
    createCourseCategory,
    initialState
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle successful submission with proper cleanup
  useEffect(() => {
    // Only process if we have a new success state and not already processing
    if (state.success && state.message && !isProcessing) {
      setIsProcessing(true);

      // Show success toast
      toast.success("Success", {
        description: state.message,
      });

      // Reset form immediately with all options
      form.reset(
        { name: "" },
        {
          keepErrors: false,
          keepDirty: false,
          keepValues: false,
          keepDefaultValues: false,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
        }
      );

      // Clear the input field directly as a fallback
      const input = document.getElementById(
        "course-category-name"
      ) as HTMLInputElement;
      if (input) {
        input.value = "";
      }

      // Force refresh the categories list
      const refreshResult = onSuccess();
      if (refreshResult instanceof Promise) {
        refreshResult.finally(() => {
          setIsProcessing(false);
        });
      } else {
        setIsProcessing(false);
      }
    } else if (!state.success && state.message && !isProcessing) {
      // Show error toast
      toast.error("Error", {
        description: state.message,
      });
    }
  }, [state.success, state.message, isProcessing, form, onSuccess]);

  const onSubmit = useCallback(
    (data: CategoryFormValues) => {
      if (isProcessing) return; // Prevent submission while processing

      const formData = new FormData();
      formData.append("name", data.name.trim());

      startTransition(() => {
        formAction(formData);
      });
    },
    [formAction, isProcessing]
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="course-category-name">Category name</FieldLabel>
          <Input
            key={state.success ? Date.now() : "input"} // Force re-render on success
            id="course-category-name"
            {...form.register("name")}
            autoComplete="off"
            aria-invalid={Boolean(form.formState.errors.name)}
            disabled={pending || isProcessing}
          />
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || isProcessing}>
          {(pending || isProcessing) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Add category
        </Button>
      </div>
    </form>
  );
}

type CourseCategoryEditFormProps = {
  category: CourseCategory;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
};

function CourseCategoryEditForm({
  category,
  onSuccess,
  onCancel,
}: CourseCategoryEditFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(courseCategorySchema),
    defaultValues: { name: category.name },
  });

  const [state, formAction, pending] = useActionState(
    updateCourseCategory,
    initialState
  );
  const [lastSuccessMessage, setLastSuccessMessage] = useState<string>("");

  // Reset form when category changes
  useEffect(() => {
    form.reset({ name: category.name });
  }, [category.id, category.name, form]);

  // Handle successful update with toast
  useEffect(() => {
    if (
      state.success &&
      state.message &&
      state.message !== lastSuccessMessage
    ) {
      setLastSuccessMessage(state.message);

      toast.success("Success", {
        description: state.message,
      });

      void onSuccess();
    } else if (!state.success && state.message) {
      toast.error("Error", {
        description: state.message,
      });
    }
  }, [state.success, state.message, lastSuccessMessage, onSuccess]);

  const onSubmit = useCallback(
    (data: CategoryFormValues) => {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("id", category.id);

      startTransition(() => {
        formAction(formData);
      });
    },
    [category.id, formAction]
  );

  const handleCancel = useCallback(() => {
    form.reset({ name: category.name });
    onCancel();
  }, [category.name, form, onCancel]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="edit-course-category-name">
            Category name
          </FieldLabel>
          <Input
            id="edit-course-category-name"
            {...form.register("name")}
            autoComplete="off"
            aria-invalid={Boolean(form.formState.errors.name)}
            disabled={pending}
          />
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update category
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
