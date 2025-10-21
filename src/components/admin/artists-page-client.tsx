"use client";

import type { ArtistListItem } from "@/types";

interface ArtistsPageClientProps {
  artists: ArtistListItem[];
  stats: {
    total: number;
    visible: number;
    featured: number;
    totalArtworks: number;
  };
}

export default function ArtistsPageClient({ artists, stats }: ArtistsPageClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Artists Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all artists in the gallery
          </p>
        </div>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Total Artists</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Visible</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.visible}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Featured</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.featured}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Total Artworks</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.totalArtworks}</div>
        </div>
      </div>

      {/* Artists will be rendered as cards by the server component */}
    </div>
  );
}