"use server";

import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export async function signOut() {
  try {
    console.log("🚪 STACK AUTH: User signing out");
    
    // Get the current user and use their signOut method
    const user = await stackServerApp.getUser();
    if (user) {
      await user.signOut({ redirectUrl: "/login" });
    } else {
      // If no user, just redirect to login
      redirect("/login");
    }
    
    console.log("✅ STACK AUTH: User signed out successfully");
  } catch (error) {
    console.error("❌ STACK AUTH: Error during sign out:", error);
    redirect("/login?error=Failed to sign out");
  }
}
