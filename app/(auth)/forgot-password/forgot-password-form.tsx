"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/user";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPasswordForm = () => {
  const [state, formAction] = useActionState(requestPasswordReset, {
    success: false,
    message: "",
  });

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button 
        type="submit" 
        className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl" 
        disabled={pending}
      >
        {pending ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Sending...</span>
          </div>
        ) : (
          "Send reset link"
        )}
      </Button>
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
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

export default ForgotPasswordForm;
