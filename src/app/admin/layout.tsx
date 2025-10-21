import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";
import AdminNavigation from "@/components/admin/admin-navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/login");
  }

  // ONLY use serverMetadata for security (clientMetadata is not secure)
  const role = user.serverMetadata?.role;
  const hasAdminAccess = role === "admin" || role === "super_admin";

  if (!hasAdminAccess) {
    redirect("/login");
  }

  const navigation = [
    { name: "Overview", href: "/admin", icon: "Home" },
    { name: "Artworks", href: "/admin/artworks", icon: "Palette" },
    { name: "Artists", href: "/admin/artists", icon: "Users" },
    { name: "Sorting", href: "/admin/sorting", icon: "ArrowUpDown" },
    { name: "Events", href: "/admin/events", icon: "Calendar" },
    { name: "Inquiries", href: "/admin/inquiries", icon: "Users" },
  ];

  // Extract only serializable user data
  const userData = {
    primaryEmail: user.primaryEmail,
    displayName: user.displayName,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileAdminNav navigation={navigation} user={userData} />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Friendship Gallery</p>
        </div>

        {/* Navigation */}
        <AdminNavigation navigation={navigation} />

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.primaryEmail?.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.primaryEmail}
              </p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

