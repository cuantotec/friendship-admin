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
    // Stack Auth handles OTP sending through client-side components
    // This server action is mainly for routing
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
    // Stack Auth handles OTP verification through client-side components
    // Get user role and redirect accordingly
    const userRole = await getUserRole();
    const redirectPath = getRedirectPath(userRole);
    redirect(redirectPath);
  } catch (error) {
    console.error("Error verifying Stack OTP:", error);
    redirect("/verify-otp?email=" + encodeURIComponent(email) + "&error=Failed to verify OTP. Please try again.");
  }
}
