"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/user";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Mail, Lock } from "lucide-react";
import { useState } from "react";

const SignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button 
        disabled={pending} 
        className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
        variant="default"
      >
        {pending ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Signing In...</span>
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    );
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      
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
            required
            type="email"
            placeholder="jondoe32@gmail.com"
            defaultValue={signInDefaultValues.email}
            autoComplete="email"
            className="pl-10 h-12 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
          />
        </div>
      </div>
      
      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            id="password"
            name="password"
            required
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••"
            defaultValue={signInDefaultValues.password}
            autoComplete="current-password"
            className="pl-10 pr-12 h-12 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-[1.02] focus:scale-[1.02]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-blue-500 transition-colors"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
      
      {/* Sign In Button */}
      <div className="pt-2">
        <SignInButton />
      </div>
      
      {/* Error Message */}
      {data && !data.success && (
        <div className="rounded-lg text-center text-red-600 text-sm animate-shake">
          {data.message}
        </div>
      )}
    </form>
  );
};

export default SignInForm;
