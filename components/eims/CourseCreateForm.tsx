"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, generateSlug } from "@/lib/utils";
import { Course } from "@/types";
import { useCourseCategories, useTeachers } from "@/hooks/useData";
import ImageDropzone from "../ImageDropzone";
import DocumentDropzone from "../DocumentDropzone";

const INITIAL_VALUES = {
  name: "",
  slug: "",
  teacherId: "",
  teacherName: "",
  description: "",
  coverImage: "",
  price: "",
  courseCategoryId: "",
};

type FormState = typeof INITIAL_VALUES;

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

  const deriveInitialState = useMemo<FormState>(() => {
    if (!course) {
      return INITIAL_VALUES;
    }

    return {
      name: course.name,
      slug: course.slug,
      teacherId: course.teacherId ?? "",
      teacherName: course.teacherName,
      description: course.description,
      coverImage: course.coverImage,
      price: (course.priceInCents / 100).toString(),
      courseCategoryId: course.courseCategoryId,
    };
  }, [course]);

  const [formState, setFormState] = useState<FormState>(deriveInitialState);
  const [isAutoSlug, setIsAutoSlug] = useState(!isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    setFormState(deriveInitialState);
    setIsAutoSlug(!isEditMode);
  }, [deriveInitialState, isEditMode]);

  useEffect(() => {
    if (!isEditMode && !formState.courseCategoryId && categoryOptions.length) {
      setFormState((prev) => ({
        ...prev,
        courseCategoryId: categoryOptions[0]?.id ?? "",
      }));
    }
  }, [categoryOptions, formState.courseCategoryId, isEditMode]);

  useEffect(() => {
    if (!formState.teacherId) {
      if (course && teacherOptions.length > 0) {
        const normalizedCourseTeacher = course.teacherName.trim().toLowerCase();
        const matchingTeacher = teacherOptions.find(
          (teacher) =>
            teacher.name.trim().toLowerCase() === normalizedCourseTeacher
        );

        if (matchingTeacher) {
          setFormState((prev) => ({
            ...prev,
            teacherId: matchingTeacher.id,
            teacherName: matchingTeacher.name,
          }));
        }
      }

      return;
    }

    const selectedTeacher = teacherOptions.find(
      (teacher) => teacher.id === formState.teacherId
    );

    if (selectedTeacher && selectedTeacher.name !== formState.teacherName) {
      setFormState((prev) => ({
        ...prev,
        teacherName: selectedTeacher.name,
      }));
    }
  }, [course, formState.teacherId, formState.teacherName, teacherOptions]);

  const isReadyToSubmit = useMemo(() => {
    const priceValue = Number(formState.price);

    return (
      Boolean(formState.name.trim()) &&
      Boolean(formState.slug.trim()) &&
      Boolean(formState.teacherId.trim()) &&
      Boolean(formState.teacherName.trim()) &&
      Boolean(formState.description.trim()) &&
      Boolean(formState.coverImage) &&
      Boolean(formState.courseCategoryId) &&
      Number.isFinite(priceValue) &&
      priceValue > 0
    );
  }, [formState]);

  const resetForm = () => {
    setFormState(deriveInitialState);
    setIsAutoSlug(!isEditMode);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.coverImage) {
      toast.error("Please upload a cover image before saving the course.");
      return;
    }

    const numericPrice = Number(formState.price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Enter a valid price greater than zero.");
      return;
    }

    if (!formState.teacherId) {
      toast.error("Select Teacher before saving the course.");
      return;
    }

    if (!formState.courseCategoryId) {
      toast.error("Select a course category before saving the course.");
      return;
    }

    try {
      setIsSubmitting(true);
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
        body: JSON.stringify({
          ...formState,
          price: numericPrice,
        }),
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
        resetForm();
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Course name</Label>
              <Input
                id="name"
                placeholder="e.g. Advanced Physics"
                value={formState.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    name,
                    slug: isAutoSlug ? generateSlug(name) : prev.slug,
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Course slug</Label>
              <Input
                id="slug"
                placeholder="advanced-physics"
                value={formState.slug}
                onChange={(event) => {
                  const value = event.target.value;
                  setIsAutoSlug(false);
                  setFormState((prev) => ({
                    ...prev,
                    slug: generateSlug(value),
                  }));
                }}
                required
              />
              {isAutoSlug ? (
                <p className="text-xs text-muted-foreground">
                  The slug is generated automatically from the course name.
                </p>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-primary underline"
                  onClick={() => {
                    setIsAutoSlug(true);
                    setFormState((prev) => ({
                      ...prev,
                      slug: generateSlug(prev.name),
                    }));
                  }}
                >
                  Revert to automatic slugging
                </button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCategoryId">Course Category</Label>
              <Select
                value={formState.courseCategoryId}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, courseCategoryId: value }))
                }
                disabled={
                  categoriesLoading ||
                  isSubmitting ||
                  isUploading ||
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
              {categoriesError ? (
                <p className="text-xs text-destructive">
                  Unable to load categories.{" "}
                  {categoryOptions.length > 0 ? "Using cached results." : ""}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher</Label>
              <Select
                value={formState.teacherId}
                onValueChange={(value) => {
                  const selectedTeacher = teacherOptions.find(
                    (teacher) => teacher.id === value
                  );
                  setFormState((prev) => ({
                    ...prev,
                    teacherId: value,
                    teacherName: selectedTeacher?.name ?? prev.teacherName,
                  }));
                }}
                disabled={
                  teachersLoading ||
                  isSubmitting ||
                  isUploading ||
                  teacherOptions.length === 0
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
              {teachersError ? (
                <p className="text-xs text-destructive">
                  Unable to load teachers.{" "}
                  {teacherOptions.length > 0
                    ? "The current assignment is still selected."
                    : "Please try again."}
                </p>
              ) : teacherOptions.length === 0 && !teachersLoading ? (
                <p className="text-xs text-destructive">
                  Add teachers in the management module before assigning a
                  course.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Select the teacher who will build lessons for this course in
                  the CMS.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Monthly Price</Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 99.99"
                value={formState.price}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    price: event.target.value,
                  }))
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Prices are charged in USD.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex flex-col gap-3">
                {formState.coverImage ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-md border">
                    <Image
                      src={formState.coverImage}
                      alt="Course cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end bg-linear-to-t from-black/50 to-transparent p-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setFormState((prev) => ({
                            ...prev,
                            coverImage: "",
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ImageDropzone
                    onUploadComplete={(url) => {
                      setFormState((prev) => ({
                        ...prev,
                        coverImage: url,
                      }));
                    }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the course content, prerequisites, and goals."
                rows={6}
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={isSubmitting || isUploading}
          >
            {isEditMode ? "Revert" : "Reset"}
          </Button>
          <Button
            type="submit"
            disabled={
              !isReadyToSubmit || isSubmitting || isUploading || teachersLoading
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Saving changes..." : "Saving..."}
              </>
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
