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
      <Header />
      <main className="flex-1 wrapper">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
