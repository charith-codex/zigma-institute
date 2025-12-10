"use client";

import {
  useEffect,
  useMemo,
  useState,
  startTransition,
  useActionState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Tag, Trash2, PencilLine } from "lucide-react";

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
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCourseCategory,
    initialState
  );

  const handleEditClick = (category: CourseCategory) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  };

  const handleEditDialogChange = (open: boolean) => {
    setEditDialogOpen(open);

    if (!open) {
      setEditingCategory(null);
    }
  };

  const handleDeleteClick = (category: CourseCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    const formData = new FormData();
    formData.append("id", categoryToDelete.id);

    startTransition(() => {
      deleteAction(formData);
    });

    setDeleteDialogOpen(false);
    setCategoryToDelete(null);

    // Refetch after a short delay to ensure backend is updated
    setTimeout(() => void refetch(), 500);
  };

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

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
            <CardTitle>
              Add course category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CourseCategoryCreateForm onSuccess={() => void refetch()} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Existing categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading
                categories...
              </div>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
                  {sortedCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm">
                        No categories yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCategories.map((category) => (
                      <TableRow key={category.id}>
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
                          >
                            <PencilLine className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(category)}
                            disabled={deleting}
                          >
                            {deleting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {deleteState.message ? (
              <p
                className={`text-sm ${
                  deleteState.success ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {deleteState.message}
              </p>
            ) : null}
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
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
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
          {editingCategory ? (
            <CourseCategoryEditForm
              category={editingCategory}
              onSuccess={() => {
                handleEditDialogChange(false);
                void refetch();
              }}
              onCancel={() => handleEditDialogChange(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type CategoryFormValues = {
  name: string;
};

type CourseCategoryCreateFormProps = {
  onSuccess: () => void;
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

  // Handle successful submission
  useEffect(() => {
    if (state.success) {
      form.reset({ name: "" });
      // Small delay to ensure backend update completes
      setTimeout(() => onSuccess(), 300);
    }
  }, [form, onSuccess, state.success]);

  const onSubmit = (data: CategoryFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name.trim());

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="course-category-name">Category name</FieldLabel>
          <Input
            id="course-category-name"
            {...form.register("name")}
            autoComplete="off"
            aria-invalid={Boolean(form.formState.errors.name)}
          />
          {form.formState.errors.name ? (
            <FieldError errors={[form.formState.errors.name]} />
          ) : null}
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Add category
        </Button>
        {state.message ? (
          <p
            className={`text-sm ${
              state.success ? "text-emerald-600" : "text-destructive"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

type CourseCategoryEditFormProps = {
  category: CourseCategory;
  onSuccess: () => void;
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

  useEffect(() => {
    form.reset({ name: category.name });
  }, [category.id, category.name, form]);

  useEffect(() => {
    if (state.success) {
      setTimeout(() => onSuccess(), 300);
    }
  }, [state.success, onSuccess]);

  const onSubmit = (data: CategoryFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("id", category.id);

    startTransition(() => {
      formAction(formData);
    });
  };

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
          />
          {form.formState.errors.name ? (
            <FieldError errors={[form.formState.errors.name]} />
          ) : null}
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Update category
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            form.reset({ name: category.name });
            onCancel();
          }}
        >
          Cancel
        </Button>
        {state.message ? (
          <p
            className={`text-sm ${
              state.success ? "text-emerald-600" : "text-destructive"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
