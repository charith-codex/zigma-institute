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
import { Loader2, Tag, Trash2, PencilLine, Plus } from "lucide-react";

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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type CategoryFormValues = { name: string };

export function CourseCategoryManagement() {
  const { categories, loading, error, refetch } = useCourseCategories();
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createState, createAction, creating] = useActionState(
    createCourseCategory,
    initialState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCourseCategory,
    initialState
  );

  useEffect(() => {
    if (createState.success) {
      void refetch();
    }
  }, [createState.success, refetch]);

  useEffect(() => {
    if (deleteState.success) {
      void refetch();
    }
  }, [deleteState.success, refetch]);

  const handleDelete = (id: string) => {
    const formData = new FormData();
    formData.append("id", id);

    startTransition(() => {
      deleteAction(formData);
    });
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
            <CardTitle>Create a category</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseCategoryForm
              key={creating ? "creating" : "create"}
              state={createState}
              pending={creating}
              onSubmit={(data) => {
                const formData = new FormData();
                formData.append("name", data.name.trim());

                startTransition(() => {
                  createAction(formData);
                });
              }}
              onSuccess={() => {
                void refetch();
              }}
              submitLabel="Add category"
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Existing categories</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2
                className={`h-4 w-4 ${loading ? "animate-spin" : "opacity-0"}`}
              />
              {loading ? "Refreshing" : ""}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="overflow-hidden rounded-lg border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-full">Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Updated</TableHead>
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
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {category.updatedAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(category);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <PencilLine className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
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

      <Dialog
        open={isEditDialogOpen && Boolean(editingCategory)}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {editingCategory ? (
            <EditCourseCategoryForm
              category={editingCategory}
              onClose={() => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
              }}
              onUpdated={() => {
                void refetch();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type CourseCategoryFormProps = {
  state: ActionState;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => void;
  onSuccess: () => void;
};

function CourseCategoryForm({
  state,
  pending,
  onSubmit,
  onSuccess,
  submitLabel,
}: CourseCategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(courseCategorySchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (state.success) {
      form.reset({ name: "" });
      onSuccess();
    }
  }, [form, onSuccess, state.success]);

  const handleSubmit = (data: CategoryFormValues) => {
    onSubmit({ name: data.name.trim() });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {submitLabel}
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

type EditCourseCategoryFormProps = {
  category: CourseCategory;
  onClose: () => void;
  onUpdated: () => void;
};

function EditCourseCategoryForm({
  category,
  onClose,
  onUpdated,
}: EditCourseCategoryFormProps) {
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
  }, [category, form]);

  useEffect(() => {
    if (state.success) {
      onUpdated();
      onClose();
    }
  }, [onClose, onUpdated, state.success]);

  const handleSubmit = (data: CategoryFormValues) => {
    const formData = new FormData();
    formData.append("id", category.id);
    formData.append("name", data.name.trim());

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PencilLine className="mr-2 h-4 w-4" />
          )}
          Update category
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
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
