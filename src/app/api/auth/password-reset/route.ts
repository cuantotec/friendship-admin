import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST(request: NextRequest) {
  try {
    const { email, action, token, newPassword } = await request.json();

    if (action === "send") {
      // Send password reset email
      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      await stackServerApp.sendPasswordResetEmail({ email });

      return NextResponse.json({
        success: true,
        message: "Password reset email sent successfully"
      });
    }

    if (action === "reset") {
      // Reset password with token
      if (!token || !newPassword || !email) {
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
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Password reset API error:", error);
    
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
