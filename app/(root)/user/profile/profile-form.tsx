"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
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
import { ProfileImageUploader } from "@/components/eims/ProfileImageUploader";
import { profileUpdateSchema } from "@/lib/validators";

const initialState: ActionState = {
  success: false,
  message: "",
};

export type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE";
  profileImage?: string;
};

type ProfileFormProps = {
  initialValues: ProfileFormValues;
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfile, initialState);
  const [profileImageUrl, setProfileImageUrl] = useState(initialValues.profileImage ?? "");
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>> & { gender?: string }
  >({});
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProfileImageUrl(initialValues.profileImage ?? "");
  }, [initialValues.profileImage]);

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
          setProfileImageUrl(data.profileImage);
        }
      } catch (error) {
        console.error("Failed to load profile image", error);
      }
    };

    void fetchProfileImage();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isImageUploading) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("profileImage", profileImageUrl);

    const getString = (value: FormDataEntryValue | null) =>
      typeof value === "string" ? value : "";

    const submission = {
      name: getString(formData.get("name")),
      phone: getString(formData.get("phone")),
      address: getString(formData.get("address")),
      dob: getString(formData.get("dob")),
      gender: getString(formData.get("gender")),
      profileImage: profileImageUrl,
    } satisfies ProfileFormValues & { gender?: string };

    const parsed = profileUpdateSchema.safeParse(submission);

    if (!parsed.success) {
      const errors: Partial<Record<keyof ProfileFormValues, string>> & {
        gender?: string;
      } = {};

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field as keyof ProfileFormValues]) {
          errors[field as keyof ProfileFormValues] = issue.message;
        }
      });

      setClientErrors(errors);
      return;
    }

    setClientErrors({});

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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <ProfileImageUploader
              value={profileImageUrl}
              onChange={(value) => setProfileImageUrl(value)}
              onUploadingChange={setIsImageUploading}
              disabled={isPending}
            />
            {clientErrors.profileImage ? (
              <p className="text-sm text-destructive">{clientErrors.profileImage}</p>
            ) : null}
            <input type="hidden" name="profileImage" value={profileImageUrl} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialValues.name}
                required
                autoComplete="name"
                aria-invalid={Boolean(clientErrors.name)}
              />
              {clientErrors.name ? (
                <p className="text-sm text-destructive">{clientErrors.name}</p>
              ) : null}
            </div>
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
              <p className="text-xs text-muted-foreground">
                Email cannot be edited.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialValues.phone}
                inputMode="numeric"
                pattern="[0-9]{10,15}"
                autoComplete="tel"
                required
                aria-invalid={Boolean(clientErrors.phone)}
              />
              {clientErrors.phone ? (
                <p className="text-sm text-destructive">{clientErrors.phone}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" defaultValue={initialValues.gender}>
                <SelectTrigger className="w-full" id="gender">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              {clientErrors.gender ? (
                <p className="text-sm text-destructive">{clientErrors.gender}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                defaultValue={initialValues.dob}
                max={new Date().toISOString().split("T")[0]}
                aria-invalid={Boolean(clientErrors.dob)}
              />
              {clientErrors.dob ? (
                <p className="text-sm text-destructive">{clientErrors.dob}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={initialValues.address}
                placeholder="Apartment, street, city"
                rows={3}
                aria-invalid={Boolean(clientErrors.address)}
              />
              {clientErrors.address ? (
                <p className="text-sm text-destructive">{clientErrors.address}</p>
              ) : null}
            </div>
          </div>

          {state.message && (
            <div
              className={`text-sm ${state.success ? "text-success" : "text-destructive"}`}
              role={state.success ? "status" : "alert"}
            >
              {state.message}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="min-w-32"
              disabled={isImageUploading || isPending}
            >
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
