"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import { formatCurrency } from "@/lib/utils";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  school: z.string().optional(),
  studentEmail: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  guardianName: z.string().min(2, "Guardian name is required"),
  guardianEmail: z.string().email("Enter a valid guardian email"),
  guardianPhone: z.string().min(6, "Enter a valid guardian phone"),
  contactPreference: z.enum(["email", "phone", "whatsapp"]).default("email"),
  goals: z.string().max(600).optional(),
  courses: z.array(z.string()).min(1, "Select at least one course"),
  studentPhoto: z
    .object({
      url: z.string().url(),
      key: z.string().min(1),
    })
    .optional(),
});

export type StudentRegistrationFormValues = z.infer<typeof registrationSchema>;

export interface StudentRegistrationCourse {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
}

interface StudentRegistrationFormProps {
  courses: StudentRegistrationCourse[];
  instituteName: string;
  instituteTagline: string;
  instituteAddress: string;
}

export function StudentRegistrationForm({
  courses,
  instituteName,
  instituteTagline,
  instituteAddress,
}: StudentRegistrationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<StudentRegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      school: "",
      studentEmail: "",
      phone: "",
      guardianName: "",
      guardianEmail: "",
      guardianPhone: "",
      contactPreference: "email",
      goals: "",
      courses: [],
      studentPhoto: undefined,
    },
  });

  const selectedCourseIds = form.watch("courses");
  const totals = useMemo(() => {
    const selected = courses.filter((course) =>
      selectedCourseIds?.includes(course.id)
    );

    const amount = selected.reduce((sum, course) => sum + course.priceInCents, 0);
    const currency = selected[0]?.currency ?? "USD";

    return {
      amount,
      currency,
      selected,
    };
  }, [courses, selectedCourseIds]);

  const onSubmit = (values: StudentRegistrationFormValues) => {
    if (!values.studentPhoto) {
      toast.error("Please upload a student passport-style photo (JPEG)");
      return;
    }

    startTransition(() => {
      fetch("/api/student-registration/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          studentPhoto: values.studentPhoto,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error ?? "Unable to start checkout");
          }

          const payload = (await response.json()) as { url?: string };
          if (!payload.url) {
            throw new Error("Stripe did not return a checkout URL");
          }

          window.location.href = payload.url;
        })
        .catch((error) => {
          console.error("Student registration checkout error", error);
          toast.error(
            error instanceof Error ? error.message : "Unable to start checkout"
          );
        });
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]" id="registration-form">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Secure student registration</CardTitle>
          <p className="text-muted-foreground text-sm">
            Share accurate details and select the courses you wish to enrol in. We
            will verify payment automatically and email LMS credentials once
            approved.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-10" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Amaya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Perera" {...field} />
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
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current school</FormLabel>
                      <FormControl>
                        <Input placeholder="Royal College" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="student@example.com" {...field} />
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
                        <Input placeholder="(+94) 77 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent / Guardian name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Sunethra Perera" {...field} />
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
                        <Input type="email" placeholder="guardian@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent / Guardian phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(+94) 71 987 6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred contact method</FormLabel>
                      <FormControl>
                        <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm shadow-sm">
                          <select
                            className="w-full bg-transparent outline-none"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning goals</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tell us about target exams or areas you want support in."
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
                    <FormLabel>Student passport photo (JPEG, max 4MB) *</FormLabel>
                    <div className="space-y-3">
                      {photoPreview ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={photoPreview}
                            alt="Student passport"
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
                        <UploadDropzone
                          endpoint="studentRegistrationPhoto"
                          className="ut-upload-dropzone border-dashed"
                          appearance={{
                            button: "bg-primary text-primary-foreground",
                          }}
                          onClientUploadComplete={(res) => {
                            const file = res?.[0];
                            if (!file) {
                              toast.error("Upload failed. Please try again.");
                              return;
                            }
                            setPhotoPreview(file.url);
                            field.onChange({ url: file.url, key: file.key });
                          }}
                          onUploadError={(error) => {
                            console.error("Photo upload error", error);
                            toast.error(error.message);
                          }}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use a recent portrait photo with a plain background.
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
                    <div className="grid gap-3">
                      {courses.map((course) => {
                        const checked = field.value?.includes(course.id) ?? false;
                        return (
                          <div
                            key={course.id}
                            className="flex items-start justify-between rounded-lg border bg-muted/40 p-4"
                          >
                            <div className="space-y-1">
                              <span className="font-semibold text-base">
                                {course.name}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(course.priceInCents, course.currency)}
                              </p>
                            </div>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                if (value) {
                                  field.onChange([...(field.value ?? []), course.id]);
                                } else {
                                  field.onChange(
                                    (field.value ?? []).filter((id) => id !== course.id)
                                  );
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4">
                <p className="text-sm font-medium text-foreground">
                  Total due today
                </p>
                <p className="text-3xl font-bold">
                  {totals.amount > 0
                    ? formatCurrency(totals.amount, totals.currency)
                    : "Select a course"}
                </p>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to Stripe Checkout to complete payment.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  By submitting you agree to our privacy policy and confirm that
                  the information provided is accurate.
                </p>
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Redirecting to Stripe…" : "Proceed to payment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>What to expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ol className="space-y-3 list-decimal pl-4">
              <li>Complete the registration form and choose courses.</li>
              <li>Pay securely through Stripe Checkout.</li>
              <li>
                Our team verifies payment automatically and prepares your ID card.
              </li>
              <li>
                Student and guardian receive LMS credentials, ID card, and next steps
                via email.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Institute details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{instituteName}</p>
            <p>{instituteTagline}</p>
            <p>{instituteAddress}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
