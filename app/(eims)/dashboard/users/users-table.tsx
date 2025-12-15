import type { ReactNode } from "react";
import type { getUsers } from "@/lib/actions/user";
import { cn } from "@/lib/utils";

type UsersTableProps = {
  users: Awaited<ReturnType<typeof getUsers>>;
};

type UserRecord = UsersTableProps["users"][number];

export function UsersTable({ users }: UsersTableProps) {
  const currentMonth = new Date().getMonth() + 1;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border overflow-hidden rounded-lg border text-sm">
        <thead className="bg-muted/60">
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Student ID</TableHeaderCell>
            <TableHeaderCell>Enrolled courses</TableHeaderCell>
            <TableHeaderCell>Monthly payment</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No users found yet.
              </td>
            </tr>
          ) : (
            users.map((user: UserRecord) => {
              const courseNames = (user.student?.enrollments ?? [])
                .map((enrollment) => enrollment.course?.name ?? null)
                .filter((name): name is string => Boolean(name));

              const hasCurrentPayment = user.paymentTransactions?.some(
                (transaction) =>
                  (transaction.monthNumber ?? -1) === currentMonth
              );

              const latestPaymentMonth = user.paymentTransactions?.[0]?.monthNumber;

              return (
                <tr key={user.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase",
                        user.role === "ADMIN"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/70 text-secondary-foreground"
                      )}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {user.student?.studentPublicId ?? "-"}
                  </TableCell>
                  <TableCell>
                    {courseNames.length > 0 ? courseNames.join(", ") : "-"}
                  </TableCell>
                  <TableCell>
                    {user.role === "STUDENT" ? (
                      hasCurrentPayment ? (
                        <span className="text-emerald-600">Paid this month</span>
                      ) : latestPaymentMonth ? (
                        <span className="text-amber-600">
                          Last paid month {latestPaymentMonth}
                        </span>
                      ) : (
                        <span className="text-destructive">No installment yet</span>
                      )
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </th>
  );
}

function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}
