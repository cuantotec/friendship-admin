"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Clock, Palette } from "lucide-react";
import PendingArtworksTab from "./pending-artworks-tab";
import ArtworksCards from "./artworks-cards";
import ArtworksFilters from "./artworks-filters";
import ArtworkModal from "../artwork-modal";
import type { ArtworkListItem } from "@/types";

interface ArtworksPageClientProps {
  artworks: ArtworkListItem[];
  pendingArtworks: ArtworkListItem[];
  stats: {
    total: number;
    visible: number;
    hidden: number;
    pending: number;
    worth: number;
  };
  locations: string[];
  artists?: Array<{ id: number; name: string; email?: string | null }>;
}

export default function ArtworksPageClient({ artworks, pendingArtworks, stats, locations, artists = [] }: ArtworksPageClientProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const searchParams = useSearchParams();

  // Check if we should show the add modal
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('add');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleArtworkUpdated = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Artworks Management</h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all artworks in the gallery
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Toggle - Mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Add Artwork Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Artwork</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Total Artworks</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Visible</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.visible}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Hidden</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-600">{stats.hidden}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </div>
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600">Total Worth</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            ${stats.worth.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Palette className="h-4 w-4" />
              <span className="font-medium">All Artworks</span>
              <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-600">
                {stats.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-2 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 data-[state=active]:border-yellow-200 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">Pending</span>
              <Badge 
                variant="secondary" 
                className={`ml-1 ${
                  stats.pending > 0 
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {stats.pending}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <ArtworksFilters locations={locations} />

          {/* Artworks Cards */}
          <ArtworksCards artworks={artworks} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingArtworksTab 
            pendingArtworks={pendingArtworks}
            onArtworkUpdated={handleArtworkUpdated}
          />
        </TabsContent>
      </Tabs>

      {/* Add Artwork Modal */}
      {showAddModal && (
        <ArtworkModal
          artwork={null}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onArtworkUpdated={handleArtworkUpdated}
          onArtworkDeleted={handleArtworkUpdated}
          artistId={artists.length > 0 ? artists[0].id : 1} // Use first artist or default
          mode="create"
          isAdmin={true}
          artists={artists}
        />
      )}
    </div>
  );
}
