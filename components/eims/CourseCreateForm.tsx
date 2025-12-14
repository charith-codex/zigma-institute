"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { cn, generateSlug } from "@/lib/utils";
import { Course } from "@/types";
import { useCourseCategories, useTeachers } from "@/hooks/useData";
import { courseSchema } from "@/lib/validators/courses";
import ImageDropzone from "../ImageDropzone";

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseCreateFormProps {
  className?: string;
  onSuccess?: () => void;
  course?: Course | null;
}

export function CourseCreateForm({
  className,
  onSuccess,
  course,
}: CourseCreateFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(course);
  const {
    teachers,
    loading: teachersLoading,
    error: teachersError,
  } = useTeachers();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCourseCategories();

  const defaultValues = useMemo<CourseFormData>(() => {
    if (!course) {
      return {
        name: "",
        slug: "",
        teacherId: "",
        teacherName: "",
        description: "",
        coverImage: "",
        price: 0,
        courseCategoryId: "",
      };
    }

    return {
      name: course.name,
      slug: course.slug,
      teacherId: course.teacherId ?? "",
      teacherName: course.teacherName,
      description: course.description,
      coverImage: course.coverImage,
      price: course.priceInCents / 100,
      courseCategoryId: course.courseCategoryId,
    };
  }, [course]);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = form;

  const teacherOptions = useMemo(() => {
    if (
      course &&
      course.teacherId &&
      !teachers.some((teacher) => teacher.id === course.teacherId)
    ) {
      return [
        ...teachers,
        {
          id: course.teacherId,
          name: course.teacherName,
          email: null,
        },
      ];
    }

    return teachers;
  }, [course, teachers]);

  const categoryOptions = useMemo(() => {
    if (
      course &&
      course.courseCategoryId &&
      !categories.some((category) => category.id === course.courseCategoryId)
    ) {
      return [
        ...categories,
        {
          id: course.courseCategoryId,
          name: course.courseCategory?.name ?? "Current category",
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
      ];
    }

    return categories;
  }, [categories, course]);

  const nameValue = watch("name");
  const teacherIdValue = watch("teacherId");
  const coverImageValue = watch("coverImage");

  // Reset form when course changes
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Auto-set category if empty
  useEffect(() => {
    const currentCategory = watch("courseCategoryId");
    if (!isEditMode && !currentCategory && categoryOptions.length) {
      setValue("courseCategoryId", categoryOptions[0]?.id ?? "");
    }
  }, [categoryOptions, isEditMode, setValue, watch]);

  // Auto-update teacher name when teacher changes
  useEffect(() => {
    if (!teacherIdValue) return;

    const selectedTeacher = teacherOptions.find(
      (teacher) => teacher.id === teacherIdValue
    );

    if (selectedTeacher) {
      setValue("teacherName", selectedTeacher.name);
    }
  }, [teacherIdValue, teacherOptions, setValue]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditMode && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, isEditMode, setValue]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      let requestEndpoint = "/api/courses";
      let requestMethod: "POST" | "PATCH" = "POST";

      if (isEditMode) {
        if (!course) {
          throw new Error("A course is required to update details.");
        }

        requestEndpoint = `/api/courses/${course.id}`;
        requestMethod = "PATCH";
      }

      const response = await fetch(requestEndpoint, {
        method: requestMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          error.error ||
            (isEditMode ? "Failed to update course" : "Failed to create course")
        );
      }

      toast.success(
        isEditMode
          ? "Course updated successfully."
          : "Course created successfully."
      );

      if (!isEditMode) {
        reset();
      }

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update course"
            : "Failed to create course"
      );
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Course name</FieldLabel>
              <Input
                id="name"
                placeholder="e.g. Advanced Physics"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Course slug</FieldLabel>
              <Input
                id="slug"
                placeholder="advanced-physics"
                {...register("slug")}
              />
              <FieldError errors={[errors.slug]} />
              {!isEditMode && (
                <FieldDescription>
                  The slug is generated automatically from the course name.
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="courseCategoryId">
                Course Category
              </FieldLabel>
              <Select
                value={watch("courseCategoryId")}
                onValueChange={(value) => setValue("courseCategoryId", value)}
                disabled={
                  categoriesLoading ||
                  isSubmitting ||
                  categoryOptions.length === 0
                }
              >
                <SelectTrigger id="courseCategoryId" className="w-full">
                  <SelectValue
                    className="truncate"
                    placeholder={
                      categoriesLoading
                        ? "Loading categories..."
                        : categoryOptions.length === 0
                          ? "No categories available"
                          : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.courseCategoryId]} />
              {categoriesError && (
                <FieldDescription className="text-destructive">
                  Unable to load categories.{" "}
                  {categoryOptions.length > 0 ? "Using cached results." : ""}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="teacherId">Teacher</FieldLabel>
              <Select
                value={watch("teacherId")}
                onValueChange={(value) => setValue("teacherId", value)}
                disabled={
                  teachersLoading || isSubmitting || teacherOptions.length === 0
                }
              >
                <SelectTrigger id="teacherId" className="w-full">
                  <SelectValue
                    className="truncate"
                    placeholder={
                      teachersLoading
                        ? "Loading teachers..."
                        : teacherOptions.length === 0
                          ? "No teachers available"
                          : "Select teacher"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {teacherOptions.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.email
                        ? `${teacher.name} (${teacher.email})`
                        : teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.teacherId]} />
              {teachersError ? (
                <FieldDescription className="text-destructive">
                  Unable to load teachers.{" "}
                  {teacherOptions.length > 0
                    ? "The current assignment is still selected."
                    : "Please try again."}
                </FieldDescription>
              ) : teacherOptions.length === 0 && !teachersLoading ? (
                <FieldDescription className="text-destructive">
                  Add teachers in the management module before assigning a
                  course.
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Select the teacher who will build lessons for this course in
                  the CMS.
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="price">Monthly Price</FieldLabel>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 99.99"
                {...register("price", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.price]} />
              <FieldDescription>Prices are charged in USD.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Cover image</FieldLabel>
              <div className="flex flex-col gap-3">
                {coverImageValue ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-md border">
                    <Image
                      src={coverImageValue}
                      alt="Course cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end bg-linear-to-t from-black/50 to-transparent p-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setValue("coverImage", "")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ImageDropzone
                    onUploadComplete={(url) => setValue("coverImage", url)}
                  />
                )}
              </div>
              <FieldError errors={[errors.coverImage]} />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe the course content, prerequisites, and goals."
                rows={6}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            {isEditMode ? "Revert" : "Reset"}
          </Button>
          <Button type="submit" disabled={isSubmitting || teachersLoading}>
            {isSubmitting ? (
              <>{isEditMode ? "Saving changes..." : "Saving..."}</>
            ) : isEditMode ? (
              "Update course"
            ) : (
              "Save course"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
