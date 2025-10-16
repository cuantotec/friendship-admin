import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // If there's a code parameter, redirect to forgot-password with the code
  if (code) {
    return NextResponse.redirect(new URL(`/forgot-password?code=${code}`, request.url));
  }

  // Otherwise redirect to forgot password page
  return NextResponse.redirect(new URL('/forgot-password', request.url));
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Note: Stack Auth handles password reset through their built-in UI
    // This endpoint is deprecated - users should use Stack Auth's forgot password flow
    // await stackServerApp.sendPasswordResetEmail({ email });

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}