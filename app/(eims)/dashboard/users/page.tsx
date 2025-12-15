import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUsers } from "@/lib/actions/user";
import { getCourses } from "@/lib/actions/course";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/app/(eims)/dashboard/users/users-table";
import { AdminStudentRegistrationPanel } from "@/app/(eims)/dashboard/users/admin-student-registration-panel";
import type { StudentRegistrationCourse } from "@/components/student-registration/RegistrationForm";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/users");
  }

  const isAuthorizedRole = ["ADMIN", "MANAGER"].includes(
    session.user.role ?? ""
  );

  if (!isAuthorizedRole) {
    redirect("/");
  }

  const users = await getUsers();
  const courses = await getCourses();

  const registrationCourses: StudentRegistrationCourse[] = courses.map(
    (course) => ({
      id: course.id,
      name: course.name,
      priceInCents: course.priceInCents,
      currency: course.currency,
      teacherName: course.teacherName,
    })
  );

  const INSTITUTE_NAME = "Zigma Institute";
  const INSTITUTE_TAGLINE =
    "AI-powered personalized learning for ambitious students.";
  const INSTITUTE_ADDRESS = "Colombo Innovation Hub, 512 Galle Road, Colombo 03";

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
        <h2 className="text-xl font-semibold">Add a student</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture student details, enroll them into courses, and generate their
          ID card without requiring online payment.
        </p>
        <div className="mt-4">
          <AdminStudentRegistrationPanel
            courses={registrationCourses}
            instituteName={INSTITUTE_NAME}
            instituteTagline={INSTITUTE_TAGLINE}
            instituteAddress={INSTITUTE_ADDRESS}
          />
        </div>
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
