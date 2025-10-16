import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: "Token, email, and new password are required" },
        { status: 400 }
      );
    }

    // Note: Stack Auth handles password reset through their built-in UI
    // This endpoint is deprecated - verification should use Stack Auth's flow
    // const isValid = await stackServerApp.verifyPasswordResetCode({ code: token });
    const isValid = false; // Deprecated endpoint
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token" },
        { status: 400 }
      );
    }

    // Note: Stack Auth handles password reset through their built-in UI
    // This endpoint is deprecated
    // await stackServerApp.resetPassword({ code: token, password: newPassword });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Password reset API error:", error);
    
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
