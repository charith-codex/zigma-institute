import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define role-based route access
const ROLE_ACCESS = {
  STUDENT: ["/lms"],
  TEACHER: ["/lms", "/lms-cms"],
  ATTENDANCE: ["/dashboard"],
  MANAGER: ["/lms","/lms-cms", "/dashboard"],
  ADMIN: ["/lms", "/lms-cms", "/dashboard"],
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/courses",
  "/gallery",
  "/student-registration",
];

// Auth routes (sign-in, forgot-password, etc.)
const AUTH_ROUTES = ["/sign-in", "/forgot-password", "/reset-password"];

// API routes that should be excluded from middleware checks
const EXCLUDED_API_ROUTES = [
  "/api/auth",
  "/api/uploadthing",
  "/api/stripe/webhook",
  "/api/chatbot",
  "/api/student-registration/verify-payment",
  "/api/student-registration/regenerate-id-card",
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Get the token from the request (Edge-compatible)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role as keyof typeof ROLE_ACCESS | undefined;

  // Allow excluded API routes
  if (EXCLUDED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute =
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) || pathname.startsWith("/user/verify-email");

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(getDefaultRoute(userRole), nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (!isLoggedIn) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access
  if (userRole) {
    // LMS routes (/lms/...)
    if (pathname.startsWith("/lms")) {
      const allowedRoles: (keyof typeof ROLE_ACCESS)[] = [
        "STUDENT",
        "MANAGER",
        "ADMIN",
      ];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(
          new URL(getDefaultRoute(userRole), nextUrl),
        );
      }
    }

    // CMS routes (/lms-cms/...)
    if (pathname.startsWith("/lms-cms")) {
      const allowedRoles: (keyof typeof ROLE_ACCESS)[] = [
        "TEACHER",
        "MANAGER",
        "ADMIN",
      ];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(
          new URL(getDefaultRoute(userRole), nextUrl),
        );
      }
    }

    // EIMS/Dashboard routes (/dashboard/...)
    if (pathname.startsWith("/dashboard")) {
      const allowedRoles: (keyof typeof ROLE_ACCESS)[] = ["MANAGER","ATTENDANCE","ADMIN"];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(
          new URL(getDefaultRoute(userRole), nextUrl),
        );
      }
    }

    // Test routes - admin only
    if (pathname.startsWith("/test")) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(
          new URL(getDefaultRoute(userRole), nextUrl),
        );
      }
    }
  }

  return NextResponse.next();
}

// Helper function to get default route based on user role
function getDefaultRoute(role: keyof typeof ROLE_ACCESS | undefined): string {
  if (!role) return "/";

  switch (role) {
    case "STUDENT":
      return "/lms";
    case "TEACHER":
      return "/lms-cms";
    case "ATTENDANCE":
      return "/dashboard";
    case "MANAGER":
      return "/dashboard";
    case "ADMIN":
      return "/dashboard";
    default:
      return "/";
  }
}

// Configure which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (*.svg, *.png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};