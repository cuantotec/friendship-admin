import { redirect } from "next/navigation";

export default async function RootPage() {
  // Always redirect to admin dashboard
  // The middleware will handle role-based access control
  redirect("/admin");
}
