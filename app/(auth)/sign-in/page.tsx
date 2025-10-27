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
import SignInForm from "./signin-form";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
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
              <span className="text-2xl font-bold tracking-tight">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Access your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 mt-2">
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
