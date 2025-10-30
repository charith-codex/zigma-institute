"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing";
import { cn, generateSlug } from "@/lib/utils";

const INITIAL_VALUES = {
  name: "",
  slug: "",
  teacherName: "",
  description: "",
  coverImage: "",
};

type FormState = typeof INITIAL_VALUES;

export function CourseCreateForm({ className }: { className?: string }) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(INITIAL_VALUES);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isReadyToSubmit = useMemo(() => {
    return (
      Boolean(formState.name.trim()) &&
      Boolean(formState.slug.trim()) &&
      Boolean(formState.teacherName.trim()) &&
      Boolean(formState.description.trim()) &&
      Boolean(formState.coverImage)
    );
  }, [formState]);

  const resetForm = () => {
    setFormState(INITIAL_VALUES);
    setIsAutoSlug(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.coverImage) {
      toast.error("Please upload a cover image before saving the course.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || "Failed to create course");
      }

      toast.success("Course created successfully.");
      resetForm();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create course"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("max-w-3xl", className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Create a new course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacherName">Instructor</Label>
              <Input
                id="teacherName"
                placeholder="e.g. Dr. Jane Doe"
                value={formState.teacherName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    teacherName: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex flex-col gap-3">
                <UploadButton
                  endpoint="imageUploader"
                  appearance={{
                    button: "w-full justify-center",
                  }}
                  content={{
                    button({ ready }) {
                      return ready ? "Upload image" : "Connecting...";
                    },
                  }}
                  onUploadBegin={() => {
                    setIsUploading(true);
                  }}
                  onClientUploadComplete={(results) => {
                    const [file] = results ?? [];
                    if (file?.url) {
                      setFormState((prev) => ({
                        ...prev,
                        coverImage: file.url,
                      }));
                      toast.success("Image uploaded successfully.");
                    }
                    setIsUploading(false);
                  }}
                  onUploadError={(error) => {
                    console.error(error);
                    toast.error(error.message);
                    setIsUploading(false);
                  }}
                />

                {formState.coverImage ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-md border">
                    <Image
                      src={formState.coverImage}
                      alt="Course cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/50 to-transparent p-2">
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
                  <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex flex-col items-center gap-2">
                        <UploadCloud className="h-6 w-6" />
                        Image preview will appear here
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
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
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={isSubmitting || isUploading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!isReadyToSubmit || isSubmitting || isUploading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save course"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
