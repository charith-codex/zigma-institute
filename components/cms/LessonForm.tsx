"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { lessonSchema } from "@/lib/validators/courses";
import { createLesson, updateLesson } from "@/lib/actions/lesson";

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonFormProps {
  courseId: string;
  lessonId?: string;
  initialData?: {
    title: string;
    description?: string | null;
  };
  onSuccess: () => void;
  onCancel?: () => void;
}

export function LessonForm({
  courseId,
  lessonId,
  initialData,
  onSuccess,
  onCancel,
}: LessonFormProps) {
  const isEditing = !!lessonId;

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      courseId,
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        courseId,
      });
    }
  }, [initialData, courseId, form]);

  const onSubmit = async (data: LessonFormValues) => {
    try {
      if (isEditing && lessonId) {
        await updateLesson(lessonId, data);
        toast.success("Lesson updated successfully!");
      } else {
        await createLesson(data);
        toast.success("Lesson created successfully!");
      }

      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to save lesson:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} lesson`
      );
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Introduction to React Hooks"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                A clear, descriptive title for the lesson
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the goals, activities, or resources for this lesson"
                  rows={4}
                  {...field}
                  value={field.value || ""}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Additional details about what students will learn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Lesson" : "Create Lesson"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
