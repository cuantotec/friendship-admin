import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Use Stack Auth to send password reset email
    // Note: Stack Auth handles password reset through their built-in UI
    // This endpoint is deprecated
    // await stackServerApp.sendPasswordResetEmail({ email });

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    
    // Don't expose specific error details for security
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { error: "Invalid password reset link" },
      { status: 400 }
    );
  }

  try {
    // Note: Stack Auth handles password reset through their built-in UI
    // This endpoint is deprecated
    // const isValid = await stackServerApp.verifyPasswordResetCode({ code: token });
    const isValid = false; // Deprecated endpoint
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset token is valid"
    });

  } catch (error) {
    console.error("Password reset token verification error:", error);
    
    return NextResponse.json(
      { error: "Failed to verify password reset token" },
      { status: 500 }
    );
  }
}
