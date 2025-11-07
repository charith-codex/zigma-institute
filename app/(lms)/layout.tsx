import { SidebarProvider } from "@/components/ui/sidebar";
import LmsHeader from "@/components/lms/lms-header";

export default function LmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SidebarProvider>
        <LmsHeader title="Student Learning Platform" />
        <main className="flex-1 pt-14">{children}</main>
      </SidebarProvider>
    </div>
  );
}
