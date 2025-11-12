import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import CmsHeader from "@/components/cms/CmsHeader";

export default function LmsCmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
