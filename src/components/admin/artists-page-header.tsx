import { Button } from "@/components/ui/button";
import { Plus, Users, Eye, Star, Image } from "lucide-react";
import type { ArtistListItem } from "@/types";

interface ArtistsPageHeaderProps {
  artists: ArtistListItem[];
  stats: {
    total: number;
    visible: number;
    featured: number;
    totalArtworks: number;
  };
}

export default function ArtistsPageHeader({ artists, stats }: ArtistsPageHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Artists Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all artists in the gallery
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Invite New Artist
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Artists</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Visible</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.visible}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Featured</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.featured}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Total Artworks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalArtworks}</p>
        </div>
      </div>

      {/* Artists Count */}
      <div className="text-sm text-gray-600">
        Showing {artists.length} artist{artists.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
