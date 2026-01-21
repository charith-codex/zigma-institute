import DashboardHeader from "@/components/eims/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { authGuard } from "@/lib/auth-guards";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Protect EIMS/Dashboard routes - allow MANAGER and ADMIN only
  await authGuard({
    allowedRoles: ["MANAGER", "ATTENDANCE", "ADMIN"],
  });
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <SessionProvider>
        <SidebarProvider>
          <DashboardHeader title="EIMS Dashboard" />
          <main className="flex-1 pt-18">{children}</main>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
