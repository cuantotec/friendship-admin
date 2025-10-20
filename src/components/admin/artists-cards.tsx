"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Eye, EyeOff, Star, UserPlus, KeyRound, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import ArtistProfileModal from "../artist-profile-modal";
import ArtistSettingsModal from "../artist-settings-modal";
import InviteExistingArtistModal from "./invite-existing-artist-modal";
import { toast } from "sonner";
import {
  toggleArtistVisibility,
  deleteArtistAdmin,
  deleteInvitationAdmin,
  sendPasswordResetEmail,
  updateUserStatus,
} from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ArtistListItem, Artist } from "@/types";

interface ArtistsCardsProps {
  artists: ArtistListItem[];
}

export default function ArtistsCards({ artists }: ArtistsCardsProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteArtistData, setInviteArtistData] = useState<{name: string, email: string | null} | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleVisibility = (artistId: number) => {
    startTransition(async () => {
      const result = await toggleArtistVisibility(artistId);
      if (result.success) {
        toast.success("Visibility updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    });
  };

  const handleDelete = (artistId: number, artistName: string, artworkCount: number, isInvitation: boolean = false) => {
    if (!isInvitation && artworkCount > 0) {
      toast.error("Cannot delete artist with existing artworks");
      return;
    }

    const itemType = isInvitation ? "invitation" : "artist";
    if (!confirm(`Are you sure you want to delete ${itemType} "${artistName}"?`)) {
      return;
    }

    startTransition(async () => {
      let result;
      if (isInvitation) {
        // For invitations, use the positive ID (convert from negative)
        const invitationId = Math.abs(artistId);
        result = await deleteInvitationAdmin(invitationId);
      } else {
        result = await deleteArtistAdmin(artistId);
      }
      
      if (result.success) {
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`);
        router.refresh();
      } else {
        toast.error(result.error || `Failed to delete ${itemType}`);
      }
    });
  };

  const handleResetPassword = (userId: string, userEmail: string) => {
    startTransition(async () => {
      const result = await sendPasswordResetEmail(userId, userEmail);
      if (result.success) {
        toast.info(result.message || "Password reset instructions", {
          duration: 8000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to send password reset email");
      }
    });
  };

  const handleBlockUser = (userId: string) => {
    startTransition(async () => {
      const result = await updateUserStatus(userId, { disabled: true });
      if (result.success) {
        toast.info(result.message || "User management instructions", {
          duration: 8000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to block user");
      }
    });
  };

  const handleUnblockUser = (userId: string) => {
    startTransition(async () => {
      const result = await updateUserStatus(userId, { disabled: false });
      if (result.success) {
        toast.info(result.message || "User management instructions", {
          duration: 8000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unblock user");
      }
    });
  };

  const handleInviteArtist = (artistName: string, artistEmail: string | null) => {
    setInviteArtistData({ name: artistName, email: artistEmail });
    setShowInviteModal(true);
  };

  if (artists.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No artists found
          </h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile-first grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
          <Card key={artist.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
            artist.isInvitation ? 'border-orange-200 bg-orange-50/30' : ''
          }`}>
            <CardContent className="p-4">
              {/* Artist Header with Image and Basic Info */}
              <div className="flex items-start gap-3 mb-3">
                <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden relative">
                  {artist.profileImage ? (
                    <Image
                      src={artist.profileImage}
                      alt={artist.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      {artist.isInvitation ? (
                        <UserPlus className="h-6 w-6 text-orange-500" />
                      ) : (
                        <Users className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {artist.name}
                        {artist.isInvitation && (
                          <span className="ml-2 text-sm text-orange-600 font-normal">
                            (Pending Invitation)
                          </span>
                        )}
                      </h3>
                      {artist.specialty && (
                        <p className="text-sm text-gray-600 truncate">
                          {artist.specialty}
                        </p>
                      )}
                      {artist.isInvitation && artist.invitedBy && (
                        <p className="text-xs text-gray-500 truncate">
                          Invited by: {artist.invitedBy}
                        </p>
                      )}
                    </div>
                    
                    {/* Featured Badge or Invitation Badge */}
                    {artist.isInvitation ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Invitation
                      </Badge>
                    ) : artist.featured ? (
                      <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Key Info Row */}
              <div className="space-y-2 mb-4">
                {/* Email */}
                {artist.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{artist.email}</span>
                  </div>
                )}

                {/* Artworks Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Artworks</span>
                  <Badge variant="outline">{artist.artworkCount}</Badge>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {artist.hasUser ? (
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Active User
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      No Account
                    </Badge>
                  )}
                  
                  <Badge 
                    variant={artist.isVisible ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {artist.isVisible ? (
                      <><Eye className="h-3 w-3 mr-1" />Visible</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" />Hidden</>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {artist.isInvitation ? (
                  /* Invitation Actions */
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 bg-orange-50 p-2 rounded border border-orange-200">
                      <p className="font-medium text-orange-800">Invitation Details:</p>
                      <p className="text-xs">Code: {artist.invitationCode}</p>
                      <p className="text-xs">Status: Pending</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Copy invitation code to clipboard
                          navigator.clipboard.writeText(artist.invitationCode || '');
                          toast.success('Invitation code copied to clipboard');
                        }}
                        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <KeyRound className="h-4 w-4 mr-1" />
                        Copy Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(artist.id, artist.name, artist.artworkCount, true)}
                        disabled={isPending}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Regular Artist Actions */
                  <>
                    {/* Primary Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Convert ArtistListItem to Artist for the modal
                          const artistData: Artist = {
                            id: artist.id,
                            name: artist.name,
                            slug: artist.slug,
                            bio: artist.bio,
                            profileImage: artist.profileImage,
                            specialty: artist.specialty,
                            exhibitions: null, // Will be loaded from database
                            isVisible: artist.isVisible,
                            isHidden: artist.isHidden ?? false,
                            featured: artist.featured,
                            createdAt: new Date(artist.createdAt)
                          };
                          setSelectedArtist(artistData);
                          setShowProfileModal(true);
                        }}
                        className="flex-1"
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Convert ArtistListItem to Artist for the modal
                          const artistData: Artist = {
                            id: artist.id,
                            name: artist.name,
                            slug: artist.slug,
                            bio: artist.bio,
                            profileImage: artist.profileImage,
                            specialty: artist.specialty,
                            exhibitions: null, // Will be loaded from database
                            isVisible: artist.isVisible,
                            isHidden: artist.isHidden ?? false,
                            featured: artist.featured,
                            createdAt: new Date(artist.createdAt)
                          };
                          setSelectedArtist(artistData);
                          setShowSettingsModal(true);
                        }}
                        className="flex-1"
                      >
                        Settings
                      </Button>
                    </div>
                    {/* User Management Actions */}
                    {artist.hasUser && artist.userId && artist.userEmail && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(artist.userId!, artist.userEmail!)}
                          disabled={isPending}
                          className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <KeyRound className="h-4 w-4 mr-1" />
                          Reset Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlockUser(artist.userId!)}
                          disabled={isPending}
                          className="flex-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <ShieldAlert className="h-4 w-4 mr-1" />
                          Block User
                        </Button>
                      </div>
                    )}

                    {/* Invite Artist for users without accounts */}
                    {!artist.hasUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInviteArtist(artist.name, artist.email)}
                        disabled={isPending}
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Invite Artist
                      </Button>
                    )}

                    {/* Visibility and Delete Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibility(artist.id)}
                        disabled={isPending}
                        className="flex-1"
                      >
                        {artist.isVisible ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                        {artist.isVisible ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(artist.id, artist.name, artist.artworkCount, false)}
                        disabled={isPending || artist.artworkCount > 0}
                        className={`flex-1 ${
                          artist.artworkCount > 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

           {/* Artist Profile Modal */}
           <ArtistProfileModal
             artist={selectedArtist}
             isOpen={showProfileModal}
             onClose={() => {
               setShowProfileModal(false);
               setSelectedArtist(null);
             }}
             onProfileUpdated={() => {
               // Refresh the page to show updated data
               window.location.reload();
             }}
             artworkCount={selectedArtist ? artists.find(a => a.id === selectedArtist.id)?.artworkCount || 0 : 0}
           />

      {/* Artist Settings Modal */}
      <ArtistSettingsModal
        artist={selectedArtist}
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedArtist(null);
        }}
        onSettingsUpdated={() => {
          // Refresh the page to show updated data
          window.location.reload();
        }}
      />

      {/* Invite Artist Modal */}
      <InviteExistingArtistModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteArtistData(null);
        }}
        onInvitationSent={() => {
          router.refresh();
        }}
        artistName={inviteArtistData?.name || ""}
        artistEmail={inviteArtistData?.email || null}
      />
    </div>
  );
}
