"use client";

import { useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/user";
import { Lock, ArrowLeft, AlertTriangle } from "lucide-react";

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
      <Button 
        type="submit" 
        className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl" 
        disabled={pending || !token}
      >
        {pending ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Updating...</span>
          </div>
        ) : (
          "Update password"
        )}
      </Button>
    );
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-center mb-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-2">Invalid reset link</p>
          <p className="text-sm text-red-500">This link may have expired or is invalid.</p>
        </div>
        <Link 
          href="/forgot-password" 
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors transform hover:scale-105 duration-200"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      
      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          New password
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="Enter new password"
            className="pl-10 h-12 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
          />
        </div>
      </div>
      
      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm password
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="Confirm new password"
            className="pl-10 h-12 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
          />
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="pt-2">
        <SubmitButton />
      </div>
      
      {/* Message Display */}
      {state.message && (
        <div className={`p-3 border rounded-lg text-center text-sm animate-shake ${
          state.success 
            ? "bg-green-50 border-green-200 text-green-600" 
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {state.message}
        </div>
      )}
      
      {/* Back to Sign In Link */}
      <div className="text-center pt-2">
        <Link 
          href="/sign-in" 
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors transform hover:scale-105 duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
