"use client";

import { useState, useEffect, useRef } from "react";
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
  User,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react";
import Image from "next/image";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Set image preview if profile image exists
      setImagePreview(artist.profileImage || null);
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
        profileImage: editedProfile.profileImage
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

