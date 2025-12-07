"use client";

import { useActionState, useEffect, useState } from "react";
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

  useEffect(() => {
    setProfileImageUrl(initialValues.profileImage ?? "");
  }, [initialValues.profileImage]);

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
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <ProfileImageUploader
              value={profileImageUrl}
              onChange={(value) => setProfileImageUrl(value)}
            />
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
              />
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
              />
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={initialValues.address}
                placeholder="Apartment, street, city"
                rows={3}
              />
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
            <Button type="submit" className="min-w-32">
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
