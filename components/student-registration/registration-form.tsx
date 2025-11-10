"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  parentEmail: "",
  notes: "",
};

type FormState = typeof INITIAL_FORM;

type PhotoState = {
  data: string;
  mimeType: string;
};

function validateEmail(value: string) {
  return /.+@.+\..+/.test(value);
}

function validatePhone(value: string) {
  return value.trim().length >= 7;
}

export function RegistrationForm() {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!/image\/jpeg/.test(file.type)) {
      setError("Please upload a JPEG photo for the ID card");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Profile photo must be smaller than 4MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",");

      setPhoto({ data: base64, mimeType: file.type });
      setPhotoPreview(result);
    };

    reader.onerror = () => {
      setError("We couldn't read that photo, please try another file");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);

    if (!formState.firstName.trim() || !formState.lastName.trim()) {
      setError("Please provide the student's full name");
      return;
    }

    if (!validateEmail(formState.email)) {
      setError("Please provide a valid student email address");
      return;
    }

    if (formState.parentEmail && !validateEmail(formState.parentEmail)) {
      setError("Parent or guardian email is not valid");
      return;
    }

    if (!validatePhone(formState.phone)) {
      setError("Please include a contact phone number");
      return;
    }

    if (!formState.address.trim()) {
      setError("An address is required for the student record");
      return;
    }

    if (!photo) {
      setError("Upload a recent passport-style photo to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/student-registration/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          parentEmail: formState.parentEmail || null,
          notes: formState.notes || null,
          profileImage: photo,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to start the checkout");
      }

      const payload = await response.json();

      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl as string;
      } else {
        throw new Error("Missing checkout URL in the response");
      }
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while starting checkout"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Student first name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formState.firstName}
            onChange={handleInputChange}
            placeholder="Amaya"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Student last name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formState.lastName}
            onChange={handleInputChange}
            placeholder="Perera"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth *</Label>
          <Input
            id="dob"
            name="dob"
            type="date"
            value={formState.dob}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number *</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="(+94) 77 123 4567"
            value={formState.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Student email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="student@example.com"
            value={formState.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentEmail">Parent or guardian email</Label>
          <Input
            id="parentEmail"
            name="parentEmail"
            type="email"
            placeholder="guardian@example.com"
            value={formState.parentEmail}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Home address *</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="123 Example Lane, Colombo"
          value={formState.address}
          onChange={handleInputChange}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Learning goals or notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Let us know about class preferences or academic goals"
          value={formState.notes}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profilePhoto">Upload student photo (JPEG, max 4MB) *</Label>
        <Input
          id="profilePhoto"
          name="profilePhoto"
          type="file"
          accept="image/jpeg"
          onChange={handlePhotoChange}
          required
        />
        {photoPreview && (
          <div className="flex items-center gap-4">
            <img
              src={photoPreview}
              alt="Student preview"
              className="h-24 w-24 rounded-lg object-cover"
            />
            <TextAnnotation />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full md:w-auto"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to Stripe...
          </span>
        ) : (
          "Proceed to secure checkout"
        )}
      </Button>
    </form>
  );
}

function TextAnnotation() {
  return (
    <p className="text-sm text-muted-foreground">
      Use a front-facing, well-lit photo. We’ll print this on the student ID.
    </p>
  );
}
