import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();

  if (session) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with 3D geometric shapes */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-indigo-800">
        {/* Floating 3D cubes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-linear-to-r from-yellow-400 to-orange-500 transform rotate-45 rounded-lg shadow-2xl animate-bounce" 
             style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-linear-to-r from-green-400 to-blue-500 transform rotate-12 rounded-lg shadow-xl animate-pulse" 
             style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-linear-to-r from-pink-500 to-purple-600 transform -rotate-12 rounded-full shadow-2xl animate-bounce" 
             style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 right-32 w-14 h-14 bg-linear-to-r from-cyan-400 to-teal-500 transform rotate-45 rounded-lg shadow-lg animate-pulse" 
             style={{ animationDelay: '0.5s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full opacity-80 animate-ping" 
             style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-ping" 
             style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-pink-300 rounded-full opacity-70 animate-ping" 
             style={{ animationDelay: '3s' }}></div>
        
        {/* 3D Books Stack */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="relative">
            {/* Book 1 - Bottom */}
            <div className="w-32 h-6 bg-linear-to-r from-red-500 to-red-700 rounded-sm shadow-lg transform perspective-1000 rotateX-15 mb-1"></div>
            {/* Book 2 - Middle */}
            <div className="w-28 h-5 bg-linear-to-r from-blue-500 to-blue-700 rounded-sm shadow-lg transform perspective-1000 rotateX-15 mb-1 ml-2"></div>
            {/* Book 3 - Top */}
            <div className="w-24 h-4 bg-linear-to-r from-green-500 to-green-700 rounded-sm shadow-lg transform perspective-1000 rotateX-15 ml-4"></div>
          </div>
        </div>
        
        {/* 3D Backpack */}
        <div className="absolute top-20 right-20 hidden lg:block">
          <div className="relative transform perspective-1000">
            {/* Main backpack body */}
            <div className="w-16 h-20 bg-linear-to-br from-purple-600 to-purple-800 rounded-lg shadow-2xl transform rotateY-15"></div>
            {/* Backpack straps */}
            <div className="absolute -left-1 top-2 w-2 h-12 bg-linear-to-b from-purple-700 to-purple-900 rounded-full"></div>
            <div className="absolute -right-1 top-2 w-2 h-12 bg-linear-to-b from-purple-700 to-purple-900 rounded-full"></div>
            {/* Front pocket */}
            <div className="absolute inset-x-2 top-4 bottom-6 bg-linear-to-br from-purple-500 to-purple-700 rounded-md shadow-inner"></div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {/* 3D Card Container */}
        <div className="w-full max-w-md transform perspective-1000">
          <Card className="relative bg-white/95 backdrop-blur-sm border-0 shadow-2xl transition-all duration-300">
            {/* 3D Card Border Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg transform rotate-1 -z-10 opacity-30"></div>
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg transform -rotate-1 -z-20 opacity-20"></div>
            
            <CardHeader className="space-y-6 pb-4 text-center relative">
              {/* Logo Section with 3D effect */}
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="group flex items-center gap-3 transform hover:scale-110 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg transform rotate-3 group-hover:rotate-6 transition-transform"></div>
                    <Image
                      priority
                      src="/logo.png"
                      width={48}
                      height={48}
                      alt={`${APP_NAME} logo`}
                      className="relative z-10 rounded-lg shadow-lg transform group-hover:rotate-3 transition-transform"
                    />
                  </div>
                  <span className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {APP_NAME}
                  </span>
                </Link>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Forgot password
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Enter your email to receive a reset link
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
