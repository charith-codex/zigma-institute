import DashboardHeader from "@/components/eims/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
