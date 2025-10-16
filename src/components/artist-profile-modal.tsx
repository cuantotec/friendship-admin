"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateArtistProfile } from "@/lib/actions/artist-actions";
import { toast } from "sonner";
import { 
  Save, 
  Loader2,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";
import type { Artist } from "@/types";

interface ArtistProfileModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

// Form data type for editing (exhibitions as string for textarea)
type ArtistFormData = Omit<Artist, 'exhibitions'> & {
  exhibitions: string | null;
};

export default function ArtistProfileModal({ 
  artist, 
  isOpen, 
  onClose,
  onProfileUpdated
}: ArtistProfileModalProps) {
  const [editedProfile, setEditedProfile] = useState<ArtistFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (artist && isOpen) {
      // Convert exhibitions array to string for editing
      const profileData: ArtistFormData = { 
        ...artist,
        exhibitions: artist.exhibitions && Array.isArray(artist.exhibitions) 
          ? artist.exhibitions.join('\n') 
          : null
      };
      setEditedProfile(profileData);
    }
  }, [artist, isOpen]);

  const handleInputChange = (field: keyof ArtistFormData, value: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      });
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    // Validate required fields
    if (!editedProfile.name?.trim()) {
      toast.error("Name is required", {
        description: "Please enter your name",
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    setIsLoading(true);
    
    const loadingToast = toast.loading("Updating profile...", {
      description: "Please wait while we save your changes."
    });
    
    try {
      const result = await updateArtistProfile({
        name: editedProfile.name,
        bio: editedProfile.bio,
        specialty: editedProfile.specialty,
        exhibitions: editedProfile.exhibitions
      });
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Profile updated successfully!", {
          description: "Your changes have been saved.",
          icon: <CheckCircle className="h-4 w-4" />
        });
        onProfileUpdated();
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update profile", {
          description: result.error || "An error occurred",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!artist || !editedProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-white border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Artist Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={editedProfile.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="mt-1"
              placeholder="Your full name"
            />
          </div>

          {/* Specialty */}
          <div>
            <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">
              Specialty / Medium
            </Label>
            <Input
              id="specialty"
              value={editedProfile.specialty || ""}
              onChange={(e) => handleInputChange("specialty", e.target.value)}
              className="mt-1"
              placeholder="e.g., Oil Painting, Sculpture, Mixed Media"
            />
            <p className="text-xs text-gray-500 mt-1">Your primary artistic medium or specialty</p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Biography
            </Label>
            <Textarea
              id="bio"
              value={editedProfile.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="mt-1"
              rows={6}
              placeholder="Tell visitors about yourself, your artistic journey, inspirations, and philosophy..."
            />
            <p className="text-xs text-gray-500 mt-1">This will be displayed on your public artist page</p>
          </div>

          {/* Exhibitions */}
          <div>
            <Label htmlFor="exhibitions" className="text-sm font-medium text-gray-700">
              Exhibitions & Achievements
            </Label>
            <Textarea
              id="exhibitions"
              value={editedProfile.exhibitions || ""}
              onChange={(e) => handleInputChange("exhibitions", e.target.value)}
              className="mt-1"
              rows={6}
              placeholder="List your exhibitions, awards, publications, and other achievements..."
            />
            <p className="text-xs text-gray-500 mt-1">Enter one per line (press Enter for new line)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

