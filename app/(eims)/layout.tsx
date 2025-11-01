import DashboardHeader from "@/components/eims/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <SessionProvider>
        <SidebarProvider>
          <main className="flex-1 wrapper">
            <DashboardHeader title="EIMS Dashboard" />
            {children}
          </main>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
