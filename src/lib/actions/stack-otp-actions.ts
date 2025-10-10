"use server";

import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { getUserRole, getRedirectPath } from "@/lib/stack-auth-helpers";

export async function sendStackOTP(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email) {
    redirect("/login?error=Email is required");
  }

  try {
    // Use Stack Auth to send OTP
    // Try different methods based on what's available
    if (stackServerApp.sendOtp) {
      await stackServerApp.sendOtp({ email });
    } else if (stackServerApp.signInWithOtp) {
      await stackServerApp.signInWithOtp({ email });
    } else {
      // Fallback: redirect to Stack Auth handler
      redirect(`/handler/stack/sign-in?email=${encodeURIComponent(email)}`);
    }

    redirect(`/verify-otp?email=${encodeURIComponent(email)}&success=OTP sent to your email`);
  } catch (error) {
    console.error("Error sending Stack OTP:", error);
    redirect("/login?error=Failed to send OTP. Please try again.");
  }
}

export async function verifyStackOTP(formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  
  if (!email || !otp) {
    redirect("/verify-otp?email=" + encodeURIComponent(email || "") + "&error=Email and OTP are required");
  }

  try {
    // Use Stack Auth to verify OTP
    let session = null;
    
    if (stackServerApp.verifyOtp) {
      const result = await stackServerApp.verifyOtp({ email, otp });
      session = result.session;
    } else if (stackServerApp.verifyOtpCode) {
      const result = await stackServerApp.verifyOtpCode({ email, code: otp });
      session = result.session;
    } else {
      redirect("/verify-otp?email=" + encodeURIComponent(email) + "&error=OTP verification not available");
    }

    if (session) {
      // Get user role and redirect accordingly
      const userRole = await getUserRole();
      const redirectPath = getRedirectPath(userRole);
      redirect(redirectPath);
    } else {
      redirect("/verify-otp?email=" + encodeURIComponent(email) + "&error=Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error("Error verifying Stack OTP:", error);
    redirect("/verify-otp?email=" + encodeURIComponent(email) + "&error=Failed to verify OTP. Please try again.");
  }
}
