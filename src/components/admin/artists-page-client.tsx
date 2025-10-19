"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import ArtistInvitationModal from "./artist-invitation-modal";
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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Header with Invite Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Artists Management</h1>
            <p className="text-gray-600 mt-1">
              View, edit, and manage all artists in the gallery
            </p>
          </div>
          
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            Invite New Artist
          </Button>
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

      {/* Invitation Modal */}
      <ArtistInvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvitationSent={() => {
          // Refresh the page to show updated data
          window.location.reload();
        }}
      />
    </>
  );
}
