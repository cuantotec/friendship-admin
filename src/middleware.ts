import { NextResponse } from "next/server";

export function middleware() {
  // Stack Auth will handle authentication automatically
  // This middleware is just a placeholder for any custom logic
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};