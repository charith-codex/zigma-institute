import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function StudentRegistrationSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const sessionId = Array.isArray(searchParams.session_id)
    ? searchParams.session_id[0]
    : searchParams.session_id;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="max-w-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            Payment received successfully
          </CardTitle>
          <CardDescription className="text-base">
            Thank you for completing your online registration. Our admissions team is
            generating your student ID card and LMS credentials now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground">
          <div className="rounded-lg bg-muted/60 p-4">
            <p className="text-foreground font-semibold">What happens next?</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                You will receive an email confirmation with your digital ID card and LMS
                login credentials once processing completes.
              </li>
              <li>
                Selected courses are activated automatically after approval—expect a welcome
                notification within the next few minutes.
              </li>
              <li>
                Guardians receive a copy of the credentials and the ID card link for easy access.
              </li>
            </ul>
          </div>
          {sessionId ? (
            <p className="text-xs">
              Stripe reference: <span className="font-medium text-foreground">{sessionId}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Return to homepage
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Contact admissions
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
