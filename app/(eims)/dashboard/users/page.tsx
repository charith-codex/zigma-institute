import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUsers } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "@/app/(eims)/dashboard/users/create-user-form";
import { UsersTable } from "@/app/(eims)/dashboard/users/users-table";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/users");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create accounts for new team members and control their access.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add a new user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          New users will be able to sign in with the email and password you set.
        </p>
        <CreateUserForm />
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Existing users</h2>
          <span className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "user" : "users"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          The table updates automatically after you create a new account.
        </p>
        <div className="mt-6">
          <UsersTable users={users} />
        </div>
      </section>
    </div>
  );
}
