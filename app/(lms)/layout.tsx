import { SidebarProvider } from "@/components/ui/sidebar";
import LmsHeader from "@/components/lms/LmsHeader";
import { SessionProvider } from "next-auth/react";
import { authGuard } from "@/lib/auth-guards";

export default async function LmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Protect LMS routes - allow STUDENT and ADMIN only
  await authGuard({
    allowedRoles: ["STUDENT", "MANAGER", "ADMIN"],
  });
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SessionProvider>
        <SidebarProvider>
          <LmsHeader title="Student Learning Platform" />
          <main className="flex-1 pt-14">{children}</main>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
