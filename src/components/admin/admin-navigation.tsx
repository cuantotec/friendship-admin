"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, Users, Calendar, ArrowUpDown } from "lucide-react";

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

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

interface AdminNavigationProps {
  navigation: NavigationItem[];
}

export default function AdminNavigation({ navigation }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = getIconComponent(item.icon);
        return (
          <Link
            key={item.name}
            href={item.href}
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
  );
}
