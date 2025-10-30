import { SessionProvider } from "next-auth/react";

export default function ShowcaseSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <SessionProvider>
        <main className="flex-1 wrapper">{children}</main>
      </SessionProvider>
    </div>
  );
}
