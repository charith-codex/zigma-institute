"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageDropzone from "@/components/ImageDropzone";
import { formatCurrency } from "@/lib/utils";
import { registrationSchema } from "@/lib/validators";

export type StudentRegistrationFormValues = z.infer<typeof registrationSchema>;

export interface StudentRegistrationCourse {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
  teacherName?: string;
}

interface StudentRegistrationFormProps {
  courses: StudentRegistrationCourse[];
  instituteName: string;
  instituteTagline: string;
  instituteAddress: string;
  mode?: "checkout" | "admin";
  onSuccess?: (payload: {
    registrationId: string;
    studentPublicId?: string | null;
    idCardUrl?: string | null;
    temporaryPassword?: string;
  }) => void;
}

export function StudentRegistrationForm({
  courses,
  instituteName,
  instituteTagline,
  instituteAddress,
  mode = "checkout",
  onSuccess,
}: StudentRegistrationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");

  const form = useForm<StudentRegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      address: "",
      gender: "",
      guardianEmail: "",
      courses: [],
      studentPhoto: undefined,
    },
  });

  const selectedCourseIds = form.watch("courses");
  const totals = useMemo(() => {
    const selected = courses.filter((course) =>
      selectedCourseIds?.includes(course.id)
    );

    const amount = selected.reduce(
      (sum, course) => sum + course.priceInCents,
      0
    );
    const currency = selected[0]?.currency ?? "USD";

    return {
      amount,
      currency,
      selected,
    };
  }, [courses, selectedCourseIds]);

  const filteredCourses = useMemo(() => {
    const query = courseQuery.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) =>
      course.name.toLowerCase().includes(query)
    );
  }, [courseQuery, courses]);

  const onSubmit = async (values: StudentRegistrationFormValues) => {
    if (!values.studentPhoto) {
      toast.error("Please upload a student photo (JPEG)");
      return;
    }

    const payload = {
      name: values.name,
      dateOfBirth: values.dateOfBirth,
      email: values.email,
      phone: values.phone,
      address: values.address?.trim() ? values.address.trim() : null,
      gender: values.gender ? values.gender : null,
      guardianEmail: values.guardianEmail,
      courses: values.courses,
      studentPhoto: values.studentPhoto,
    };

    setIsSubmitting(true);

    try {
      if (mode === "admin") {
        const response = await fetch("/api/admin/student-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          throw new Error(errorPayload?.error ?? "Unable to create student");
        }

        const responsePayload = (await response.json()) as {
          registrationId: string;
          studentPublicId?: string | null;
          idCardUrl?: string | null;
          temporaryPassword?: string;
        };

        toast.success("Student added without payment");
        form.reset();
        setPhotoPreview(null);
        onSuccess?.(responsePayload);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/student-registration/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error ?? "Unable to start checkout");
      }

      const responsePayload = (await response.json()) as { url?: string };
      if (!responsePayload.url) {
        throw new Error("Stripe did not return a checkout URL");
      }

      window.location.href = responsePayload.url;
    } catch (error) {
      console.error("Student registration checkout error", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to start checkout"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl font-bold">
            Student registration
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student full name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Amaya Perera" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="student@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student mobile *</FormLabel>
                    <FormControl>
                      <Input placeholder="077 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="flex gap-6"
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="MALE" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="FEMALE" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent / Guardian email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="guardian@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="House number, street, city"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentPhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Student photo (JPEG, PNG, WebP, or AVIF, max 4MB) *
                  </FormLabel>
                  <div className="space-y-3">
                    {photoPreview ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={photoPreview}
                          alt="Student photo preview"
                          className="h-32 w-32 rounded-lg border object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPhotoPreview(null);
                            field.onChange(undefined);
                          }}
                        >
                          Remove photo
                        </Button>
                      </div>
                    ) : (
                      <ImageDropzone
                        onUploadComplete={(url) => {
                          if (!url) {
                            toast.error("Upload failed. Please try again.");
                            return;
                          }

                          // Extract key from UploadThing URL pattern
                          // Expected format: https://utfs.io/f/{key}
                          const key = url.split("/").pop() || "";

                          if (!key) {
                            toast.error(
                              "Invalid upload response. Please try again."
                            );
                            return;
                          }

                          setPhotoPreview(url);
                          field.onChange({ url, key });
                        }}
                        disabled={isSubmitting}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Use a recent portrait photo with a plain background (JPEG,
                      PNG, WebP, or AVIF).
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courses"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-base font-medium">
                    Select courses to enrol in *
                  </FormLabel>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {totals.selected.length > 0 ? (
                        totals.selected.map((course) => (
                          <Badge key={course.id} variant="secondary">
                            {course.name}
                          </Badge>
                        ))
                      ) : (
                        <span>No courses selected yet</span>
                      )}
                    </div>
                    <Input
                      placeholder="Search courses by name"
                      value={courseQuery}
                      onChange={(event) => setCourseQuery(event.target.value)}
                    />
                  </div>
                  <ScrollArea className="max-h-[80vh] rounded-lg border">
                    <div className="space-y-3 p-3">
                      {filteredCourses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No courses match &ldquo;{courseQuery}&rdquo;.
                        </p>
                      ) : (
                        filteredCourses.map((course) => {
                          const checked =
                            field.value?.includes(course.id) ?? false;
                          return (
                            <div
                              key={course.id}
                              className="flex items-start justify-between rounded-lg bg-muted/40 p-4"
                            >
                              <div className="space-y-1 pr-4 flex-1">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="font-semibold text-base">
                                    {course.name}
                                  </span>
                                  <p className="text-sm font-semibold text-red-400">
                                    {formatCurrency(
                                      course.priceInCents,
                                      course.currency
                                    )}
                                  </p>
                                </div>
                                {course.teacherName && (
                                  <p className="text-sm text-muted-foreground">
                                    {course.teacherName}
                                  </p>
                                )}
                              </div>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value) {
                                    field.onChange([
                                      ...(field.value ?? []),
                                      course.id,
                                    ]);
                                  } else {
                                    field.onChange(
                                      (field.value ?? []).filter(
                                        (id) => id !== course.id
                                      )
                                    );
                                  }
                                }}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "checkout" ? (
              <>
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm font-medium text-foreground">
                    Total due today
                  </p>
                  <p className="text-3xl font-bold">
                    {totals.amount > 0
                      ? formatCurrency(totals.amount, totals.currency)
                      : "Select a course"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You will be redirected to Stripe Checkout to complete
                    payment.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Redirecting to Stripe…"
                      : "Proceed to payment"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Payment is skipped for admin-created students.
                  Enrolments and ID card will be generated automatically.
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Creating student…" : "Create student"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
