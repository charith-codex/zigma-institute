import type { ReactNode } from "react";
import type { getUsers } from "@/lib/actions/user";
import { cn } from "@/lib/utils";

type UsersTableProps = {
  users: Awaited<ReturnType<typeof getUsers>>;
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border overflow-hidden rounded-lg border text-sm">
        <thead className="bg-muted/60">
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            users.map((user: any) => (
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
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </tr>
            ))
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
