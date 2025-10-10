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

    // Verify token first
    const isValid = await stackServerApp.verifyPasswordResetToken({ token, email });
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token" },
        { status: 400 }
      );
    }

    // Reset the password
    await stackServerApp.resetPassword({ token, email, newPassword });

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
