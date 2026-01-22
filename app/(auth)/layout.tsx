import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDefaultRoute } from "@/lib/auth-guards";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  // Redirect logged-in users to their default route
  const session = await auth();
  if (session?.user) {
    redirect(getDefaultRoute(session.user.role));
  }

  return <div className="min-h-screen w-full">{children}</div>;
};
export default AuthLayout;
