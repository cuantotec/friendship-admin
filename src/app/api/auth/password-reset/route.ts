import { NextRequest, NextResponse } from "next/server";
// import { stackServerApp } from "@/stack/server";

// Note: This route is deprecated in favor of Stack Auth's built-in password reset flow
// Stack Auth handles password reset automatically through their UI components

export async function POST(_request: NextRequest) {
  try {
    // const { email, action, token, newPassword } = await request.json();

    // Stack Auth handles password reset through their built-in flow
    // This endpoint is kept for backwards compatibility but returns a redirect message
    
    return NextResponse.json(
      { 
        error: "Please use Stack Auth's password reset flow",
        message: "Password reset is handled by Stack Auth. Please use the forgot password link on the login page."
      },
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
