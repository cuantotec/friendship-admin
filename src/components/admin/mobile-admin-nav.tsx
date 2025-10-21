"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  LogOut, 
  Menu, 
  Plus,
  Home,
  Palette,
  Users,
  Calendar,
  ArrowUpDown,
  Download,
  UserPlus
} from "lucide-react";
import { ExportDataModal } from "./export-data-modal";
import { InviteArtistModal } from "./invite-artist-modal";

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

// Helper function to get icon component by name
function getIconComponent(iconName: string) {
  const iconMap = {
    Home,
    Palette,
    Users,
    Calendar,
    ArrowUpDown,
  };
  return iconMap[iconName as keyof typeof iconMap] || Home;
}

interface MobileAdminNavProps {
  navigation: NavigationItem[];
  user: {
    primaryEmail?: string | null;
    displayName?: string | null;
  };
}

export function MobileAdminNav({ navigation, user }: MobileAdminNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = () => {
    // Create a form and submit it to trigger the sign out
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/auth/signout';
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 bg-white">
              <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Friendship Gallery</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = getIconComponent(item.icon);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border-l-4 border-l-blue-500 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 transition-colors ${
                          isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                        }`} />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Quick Actions */}
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setIsOpen(false);
                        // Navigate to artworks page with add parameter
                        window.location.href = '/admin/artworks?add=true';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Artwork
                    </Button>
                    <InviteArtistModal>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Invite an Artist
                      </Button>
                    </InviteArtistModal>
                    <ExportDataModal>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                    </ExportDataModal>
                  </div>
                </div>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 px-4 py-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.primaryEmail?.slice(0, 1).toUpperCase() || "A"}
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
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Friendship Gallery</p>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="flex items-center gap-2">
          <InviteArtistModal>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          </InviteArtistModal>
          <ExportDataModal>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </ExportDataModal>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/artworks?add=true'}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
