import { SidebarProvider } from "@/components/ui/sidebar";
import LmsHeader from "@/components/lms/lms-header";

export default function LmsCmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider>
        <main className="flex-1 wrapper">
          <LmsHeader title="Content Management Platform" />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
