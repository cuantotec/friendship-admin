"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "default" | "green" | "blue" | "purple" | "orange" | "red";
  description?: string;
  className?: string;
}

const colorClasses = {
  default: "text-gray-900",
  green: "text-green-600",
  blue: "text-blue-600", 
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600"
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "default",
  description,
  className = ""
}: StatsCardProps) {
  return (
    <Card className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs sm:text-sm text-gray-600">{title}</div>
            <div className={`text-lg sm:text-2xl font-bold ${colorClasses[color]}`}>
              {value}
            </div>
            {description && (
              <div className="text-xs text-gray-500 mt-1">{description}</div>
            )}
          </div>
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${colorClasses[color]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
