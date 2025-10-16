import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes - require admin role
  // Admin dashboard lives at / but management pages are at /admin/*
  if (pathname.startsWith("/admin")) {
    const user = await stackServerApp.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ONLY use serverMetadata for security (clientMetadata is not secure)
    const role = user.serverMetadata?.role;
    const hasAdminAccess = role === "admin" || role === "super_admin";

    // Redirect non-admins to home
    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};