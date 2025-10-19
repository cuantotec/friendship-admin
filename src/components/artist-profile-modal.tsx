"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateArtistProfile } from "@/lib/actions/artist-actions";
import { deleteArtistAdmin } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import { 
  Save, 
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  Shield
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Artist } from "@/types";

interface ArtistProfileModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
  artworkCount?: number;
}

// Form data type for editing (exhibitions as string for textarea)
type ArtistFormData = Omit<Artist, 'exhibitions'> & {
  exhibitions: string | null;
  preApproved?: boolean;
};

export default function ArtistProfileModal({ 
  artist, 
  isOpen, 
  onClose,
  onProfileUpdated,
  artworkCount = 0
}: ArtistProfileModalProps) {
  const [editedProfile, setEditedProfile] = useState<ArtistFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (artist && isOpen) {
      // Convert exhibitions array to string for editing
      const profileData: ArtistFormData = { 
        ...artist,
        exhibitions: artist.exhibitions && Array.isArray(artist.exhibitions) 
          ? artist.exhibitions.join('\n') 
          : null,
        preApproved: false // Will be loaded from database separately
      };
      console.log("Artist profile data:", profileData);
      setEditedProfile(profileData);
      // Set image preview if profile image exists
      setImagePreview(artist.profileImage || null);
    }
  }, [artist, isOpen]);

  const handleInputChange = (field: keyof ArtistFormData, value: string | boolean) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file", {
        description: "Only image files are allowed",
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", {
        description: "Please select an image smaller than 5MB",
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    setIsUploadingImage(true);
    const loadingToast = toast.loading("Uploading image...", {
      description: "Please wait while we upload your profile image."
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update the profile with the new image URL
      if (editedProfile) {
        setEditedProfile({
          ...editedProfile,
          profileImage: result.originalUrl
        });
        setImagePreview(result.originalUrl);
      }

      toast.dismiss(loadingToast);
      toast.success("Image uploaded successfully!", {
        description: "Your profile image has been updated.",
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        profileImage: null
      });
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
        exhibitions: editedProfile.exhibitions,
        profileImage: editedProfile.profileImage,
        preApproved: editedProfile.preApproved
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

  const handleDeleteArtist = async () => {
    if (!artist) return;

    if (artworkCount > 0) {
      toast.error("Cannot delete artist with existing artworks", {
        description: "Please delete or reassign all artworks first"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete artist "${artist.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting artist...", {
      description: "Please wait while we remove the artist."
    });

    try {
      const result = await deleteArtistAdmin(artist.id);
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Artist deleted successfully", {
          description: "The artist has been removed from the system.",
          icon: <CheckCircle className="h-4 w-4" />
        });
        onClose();
        router.refresh();
      } else {
        toast.dismiss(loadingToast);
        toast.error(result.error || "Failed to delete artist", {
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete artist", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsDeleting(false);
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
          {/* Profile Image */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Profile Image
            </Label>
            <div className="mt-2">
              <div className="flex items-center gap-4">
                {/* Image Preview */}
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative group">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={handleImageClick}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={handleImageClick}
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageClick}
                    disabled={isUploadingImage}
                    className="flex items-center gap-2"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to upload a profile image (max 5MB)
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

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

          {/* Pre-Approval Toggle */}
          <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            editedProfile.preApproved 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  editedProfile.preApproved 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className={`text-base font-semibold ${
                      editedProfile.preApproved ? 'text-emerald-900' : 'text-amber-900'
                    }`}>
                      Pre-Approved Artist
                    </Label>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      editedProfile.preApproved 
                        ? 'bg-emerald-200 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-200 text-amber-800 border border-amber-300'
                    }`}>
                      {editedProfile.preApproved ? '✓ ENABLED' : '⚠ DISABLED'}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${
                    editedProfile.preApproved ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {editedProfile.preApproved 
                      ? '✅ This artist can upload artworks directly to the website without admin review'
                      : '⏳ This artist\'s artworks will require admin approval before going live'
                    }
                  </p>
                  <div className={`text-xs px-3 py-1 rounded-md ${
                    editedProfile.preApproved 
                      ? 'text-emerald-600 bg-emerald-100' 
                      : 'text-amber-600 bg-amber-100'
                  }`}>
                    💡 {editedProfile.preApproved 
                      ? 'Artist has auto-approval enabled' 
                      : 'Toggle this on for trusted artists who don\'t need artwork review'
                    }
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out ${
                  editedProfile.preApproved 
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={editedProfile.preApproved || false}
                    onChange={(e) => handleInputChange("preApproved", e.target.checked)}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("preApproved", !editedProfile.preApproved)}
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-200 ease-in-out ${
                      editedProfile.preApproved ? 'translate-x-6 shadow-xl' : 'translate-x-1 shadow-md'
                    }`}
                  />
                </div>
                <span className={`text-xs font-semibold transition-colors duration-200 ${
                  editedProfile.preApproved ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {editedProfile.preApproved ? 'Auto-approve' : 'Require review'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isLoading || isDeleting}
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
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
            </div>
            
            {/* Delete Button */}
            <Button
              variant="outline"
              onClick={handleDeleteArtist}
              disabled={isLoading || isDeleting || artworkCount > 0}
              className={`flex items-center gap-2 ${
                artworkCount > 0
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              }`}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {artworkCount > 0 ? "Cannot Delete (Has Artworks)" : "Delete Artist"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

