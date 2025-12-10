"use client";

import { startTransition, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/user";
import { updateUserProfile } from "@/lib/actions/user";
import { ProfileFormValues, profileSchema } from "@/lib/validators/profile";

const initialState: ActionState = {
  success: false,
  message: "",
};

type ProfileFormProps = {
  initialValues: ProfileFormValues;
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  const [state, formAction, pending] = useActionState(
    updateUserProfile,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.message, state.success]);

  const onSubmit = (data: ProfileFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    startTransition(() => {
      formAction(formData);
    });
  };

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Full name field */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-profile-name">
                      Full name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="user-profile-name"
                      aria-invalid={fieldState.invalid}
                      autoComplete="name"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Email field (read-only) */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-profile-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="user-profile-email"
                      aria-invalid={fieldState.invalid}
                      readOnly
                      disabled
                      className="bg-muted/40"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be edited.
                    </p>
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Phone field */}
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-profile-phone">Phone</FieldLabel>
                    <Input
                      {...field}
                      id="user-profile-phone"
                      aria-invalid={fieldState.invalid}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Gender field */}
              <Controller
                name="gender"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-profile-gender">
                      Gender
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="user-profile-gender"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Date of birth field */}
              <Controller
                name="dob"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-profile-dob">
                      Date of birth
                    </FieldLabel>
                    <Input
                      {...field}
                      id="user-profile-dob"
                      type="date"
                      aria-invalid={fieldState.invalid}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Address field */}
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-profile-address">
                      Address
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="user-profile-address"
                      aria-invalid={fieldState.invalid}
                      placeholder="Apartment, street, city"
                      rows={3}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="min-w-32">
              {pending ? "Submitting..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
