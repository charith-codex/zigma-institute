import Chatbot from "@/components/chatbot";
import Footer from "@/components/footer";
import Header from "@/components/shared/header";

export default function ShowcaseSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <div className="bg-linear-to-b from-blue-700/20 via-purple-500/20 to-transparent dark:from-blue-700/30 dark:via-purple-500/30 dark:to-transparent backdrop-blur-lg z-50">
        <Header />
        <main className="flex-1 wrapper">{children}</main>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
}
