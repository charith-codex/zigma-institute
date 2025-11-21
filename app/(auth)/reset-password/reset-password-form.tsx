"use client";

import { useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/user";

interface ResetPasswordFormProps {
  token: string | null;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const initialState = useMemo(
    () => ({ success: false, message: "" }),
    []
  );
  const [state, formAction] = useActionState(resetPassword, initialState);

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" className="w-full" disabled={pending || !token}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    );
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-destructive">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-sm font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
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

export default ResetPasswordForm;
