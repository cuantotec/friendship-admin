import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";

export default async function RootPage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const role = user.serverMetadata?.role;
  const isAdmin = role === "admin" || role === "super_admin";

  if (isAdmin) {
    redirect("/admin");
  } else {
    // For non-admin users, redirect to a simple landing page or login
    redirect("/login");
  }
}
