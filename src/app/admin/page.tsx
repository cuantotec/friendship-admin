import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { getAdminStats, getAllArtworks } from "@/lib/actions/admin-actions";
import AdminArtworksDashboard from "@/components/admin/admin-artworks-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Verify admin access
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // ONLY use serverMetadata for security (clientMetadata is not secure)
  const role = user.serverMetadata?.role;
  const hasAdminAccess = role === "admin" || role === "super_admin";

  if (!hasAdminAccess) {
    redirect("/");
  }

  // Fetch admin data
  const stats = await getAdminStats();
  const allArtworks = await getAllArtworks();
  
  // Filter featured artworks
  const featuredArtworks = allArtworks.filter(artwork => artwork.featured !== null && artwork.featured > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminArtworksDashboard 
        stats={stats}
        featuredArtworks={featuredArtworks}
        totalArtworks={allArtworks.length}
      />
    </div>
  );
}
