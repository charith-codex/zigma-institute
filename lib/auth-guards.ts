import { auth } from "@/auth";
import { redirect } from "next/navigation";

type UserRole = "STUDENT" | "TEACHER" | "ATTENDANCE" | "MANAGER" | "ADMIN";

interface AuthGuardOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Server-side auth guard for protecting routes
 * Call this in Server Components (layouts, pages) to enforce authentication
 */
export async function authGuard(options: AuthGuardOptions = {}) {
  const { allowedRoles, redirectTo = "/sign-in", requireAuth = true } = options;

  const session = await auth();

  // Check if authentication is required
  if (requireAuth && !session?.user) {
    redirect(redirectTo);
  }

  // Check role-based access
  if (allowedRoles && session?.user) {
    const userRole = session.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate default route based on user role
      redirect(getDefaultRoute(userRole));
    }
  }

  return session;
}

/**
 * Get default route based on user role
 */
export function getDefaultRoute(role?: string): string {
  switch (role) {
    case "STUDENT":
      return "/lms";
    case "TEACHER":
      return "/lms-cms";
    case "ATTENDANCE":
      return "/lms-cms";
    case "MANAGER":
      return "/dashboard";
    case "ADMIN":
      return "/dashboard";
    default:
      return "/";
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  session: { user?: { role?: string } } | null,
  allowedRoles: UserRole[],
): boolean {
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role as UserRole);
}
