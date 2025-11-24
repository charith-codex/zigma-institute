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
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-6 pb-2 border-b">
          <div className="flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <Image
                priority
                src="/logo.png"
                width={42}
                height={42}
                alt={`${APP_NAME} logo`}
                className="rounded-lg shadow-sm"
              />
              <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
            </Link>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold">
              Forgot password
            </CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Enter your email to receive a reset link
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 mt-2">
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
