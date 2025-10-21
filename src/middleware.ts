import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await stackServerApp.getUser();

  // If user is logged in, handle redirects based on role
  if (user) {
    const role = user.serverMetadata?.role;
    const isAdmin = role === "admin" || role === "super_admin";

    // If logged in user tries to access login page, redirect them to appropriate page
    if (pathname === "/login") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        // For non-admin users, redirect to artist dashboard
        return NextResponse.redirect(new URL("/artist", request.url));
      }
    }

    // If logged in user accesses root page, redirect based on role
    if (pathname === "/") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        // For non-admin users, redirect to artist dashboard
        return NextResponse.redirect(new URL("/artist", request.url));
      }
    }

    // Protect /admin routes - require admin role
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        // For non-admin users, redirect to artist dashboard
        return NextResponse.redirect(new URL("/artist", request.url));
      }
    }

    // Protect /artist routes - require artist role (non-admin users)
    if (pathname.startsWith("/artist")) {
      if (isAdmin) {
        // For admin users, redirect to admin dashboard
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  } else {
    // User is not logged in
    // Redirect to login if trying to access protected routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/artist") || pathname === "/") {
      const loginUrl = new URL("/login", request.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};