import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import CmsHeader from "@/components/cms/CmsHeader";
import { authGuard } from "@/lib/auth-guards";

export default async function LmsCmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Protect CMS routes - allow TEACHER, ATTENDANCE, MANAGER, and ADMIN
  await authGuard({
    allowedRoles: ["TEACHER", "MANAGER", "ADMIN"],
  });
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SessionProvider>
        <SidebarProvider>
          <CmsHeader title="Content Management Platform" />
          <main className="flex-1 pt-14">{children}</main>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
