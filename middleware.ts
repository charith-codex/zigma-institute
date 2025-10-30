import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = [
  /\/dashboard/,
  /\/lms/,
  /\/lms-cms/,
  /\/profile/,
  /\/user\/(.*)/,
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!protectedPaths.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lms/:path*",
    "/lms-cms/:path*",
    "/profile/:path*",
    "/user/:path*",
  ],
};
