import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  return (
    <div className="wrapper space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {session.user.role === "ADMIN"
            ? "Invite teammates and manage your learning platform."
            : "Keep track of your enrollments and upcoming lessons."}
        </p>
      </header>

      {session.user.role === "ADMIN" ? (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add new users from the admin console so they can sign in right
            away.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard/users">Manage users</Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;re building out more student tools soon. Check back later for
            enrolment details.
          </p>
        </section>
      )}
    </div>
  );
}