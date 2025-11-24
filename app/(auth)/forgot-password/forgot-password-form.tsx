"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/user";

const ForgotPasswordForm = () => {
  const [state, formAction] = useActionState(requestPasswordReset, {
    success: false,
    message: "",
  });

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <SubmitButton />
      {state.message && (
        <p
          className={`text-sm text-center ${
            state.success ? "text-emerald-600" : "text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}
      <div className="text-center text-sm">
        <Link href="/sign-in" className="font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
