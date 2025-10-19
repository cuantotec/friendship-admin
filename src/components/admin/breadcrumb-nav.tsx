"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      <Link href="/admin">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-700">
          <Home className="h-3 w-3 mr-1" />
          Admin
        </Button>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-3 w-3 text-gray-400" />
          {item.href ? (
            <Link href={item.href}>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-700">
                {item.label}
              </Button>
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
