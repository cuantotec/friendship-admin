import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 API: User signing out via API route");

    // Get the current user
    const user = await stackServerApp.getUser();
    
    if (!user) {
      console.log("❌ API: No user found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Use the user's signOut method - Stack Auth will handle the redirect
    await user.signOut();
    
    console.log("✅ API: User signed out successfully");
    
    // Stack Auth handles the redirect, so we don't need to return anything
    return new NextResponse(null, { status: 200 });
    
  } catch (error) {
    console.error("❌ API: Error during sign out:", error);
    
    // Even if there's an error, redirect to login
    return NextResponse.redirect(new URL("/login?error=Failed to sign out", request.url));
  }
}
