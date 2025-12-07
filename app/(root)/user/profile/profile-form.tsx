"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UserRound } from "lucide-react";

import { ProfileImageUploader } from "@/components/eims/ProfileImageUploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import type { ActionState } from "@/lib/actions/user";
import { updateUserProfile } from "@/lib/actions/user";
import { profileUpdateSchema } from "@/lib/validators";

const initialState: ActionState = {
  success: false,
  message: "",
};

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

type ProfileFormProps = {
  initialValues: ProfileFormValues & { email: string };
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfile, initialState);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialValues.name,
      phone: initialValues.phone,
      address: initialValues.address ?? "",
      dob: initialValues.dob ?? "",
      gender: initialValues.gender ?? undefined,
      profileImage: initialValues.profileImage ?? "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      name: initialValues.name,
      phone: initialValues.phone,
      address: initialValues.address ?? "",
      dob: initialValues.dob ?? "",
      gender: initialValues.gender ?? undefined,
      profileImage: initialValues.profileImage ?? "",
    });
  }, [
    form,
    initialValues.address,
    initialValues.dob,
    initialValues.gender,
    initialValues.name,
    initialValues.phone,
    initialValues.profileImage,
  ]);

  useEffect(() => {
    let isActive = true;

    const fetchProfileImage = async () => {
      try {
        const response = await fetch("/api/user/profile", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data: { profileImage?: string | null } = await response.json();

        if (isActive && data.profileImage) {
          form.setValue("profileImage", data.profileImage, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Failed to load profile image", error);
      }
    };

    void fetchProfileImage();

    return () => {
      isActive = false;
    };
  }, [form]);

  const onSubmit = form.handleSubmit((values) => {
    if (isImageUploading) {
      return;
    }

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("phone", values.phone);
    formData.set("address", values.address ?? "");
    formData.set("dob", values.dob ?? "");
    formData.set("gender", values.gender ?? "");
    formData.set("profileImage", values.profileImage ?? "");

    startTransition(() => {
      formAction(formData);
    });
  });

  const isSubmitting = isPending || form.formState.isSubmitting || isImageUploading;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserRound className="h-5 w-5" />
          Personal details
        </CardTitle>
        <CardDescription>
          Keep your contact information current. Email changes are disabled for
          account security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <ProfileImageUploader
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value)}
                    onUploadingChange={setIsImageUploading}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="name">Full name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        autoComplete="name"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={initialValues.email}
                  readOnly
                  disabled
                  className="bg-muted/40"
                />
                <p className="text-xs text-muted-foreground">Email cannot be edited.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="phone">Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="phone"
                        inputMode="numeric"
                        pattern="[0-9]{10,15}"
                        autoComplete="tel"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="gender">Gender</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full" id="gender">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="dob">Date of birth</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="dob"
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="address">Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="address"
                        placeholder="Apartment, street, city"
                        rows={3}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {state.message ? (
              <div
                className={`text-sm ${state.success ? "text-success" : "text-destructive"}`}
                role={state.success ? "status" : "alert"}
              >
                {state.message}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" className="min-w-32" disabled={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
