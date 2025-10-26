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
        <CardHeader className="space-y-2">
          <Link href="/" className="flex-center">
            <Image
              priority={true}
              src="/logo.png"
              width={80}
              height={80}
              alt={`${APP_NAME} logo`}
            />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
