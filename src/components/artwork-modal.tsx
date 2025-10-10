"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateArtwork, deleteArtwork } from "@/lib/actions/artwork-actions";
import { toast } from "sonner";
import { 
  Edit, 
  Save, 
  Trash2, 
  Palette,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

type Artwork = {
  id?: number;
  title?: string;
  slug?: string;
  artistId?: number;
  year?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  price?: number;
  status?: string;
  featured?: boolean;
  watermarkedImage?: string;
  originalImage?: string;
  globalLocationId?: number;
  artistLocationId?: number;
  createdAt?: string;
};

interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onArtworkUpdated: (artwork: Artwork) => void;
  onArtworkDeleted: (artworkId: number) => void;
}

export default function ArtworkModal({ 
  artwork, 
  isOpen, 
  onClose, 
  onArtworkUpdated,
  onArtworkDeleted
}: ArtworkModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedArtwork, setEditedArtwork] = useState<Artwork | null>(null);
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize edited artwork when modal opens
  useEffect(() => {
    if (artwork && isOpen) {
      setEditedArtwork({ ...artwork });
      setIsEditing(false);
    }
  }, [artwork, isOpen]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedArtwork({ ...artwork });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedArtwork({ ...artwork });
  };

  const handleSave = async () => {
    if (!editedArtwork || !artwork || !artwork.id) return;

    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Saving artwork changes...", {
      description: "Please wait while we update your artwork."
    });
    
    try {
      const result = await updateArtwork(artwork.id, editedArtwork);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Artwork updated successfully!", {
          description: `"${editedArtwork.title}" has been saved.`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        onArtworkUpdated(result.data);
        setIsEditing(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update artwork", {
          description: result.error,
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update artwork", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!artwork || !artwork.id) return;

    if (!window.confirm("Are you sure you want to delete this artwork? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Deleting artwork...", {
      description: "Please wait while we remove your artwork."
    });
    
    try {
      const result = await deleteArtwork(artwork.id);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Artwork deleted successfully!", {
          description: `"${artwork.title}" has been removed.`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        onArtworkDeleted(artwork.id!);
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete artwork", {
          description: result.error,
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete artwork", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (editedArtwork) {
      setEditedArtwork({
        ...editedArtwork,
        [field]: value
      });
    }
  };

  if (!artwork) return null;

  const currentArtwork = isEditing ? editedArtwork : artwork;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-white p-0 m-4 sm:m-6 lg:m-8 animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Artwork" : "Artwork Details"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full sm:w-auto bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="bg-white p-4 sm:p-6 lg:p-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Processing...</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Image Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square sm:aspect-[4/3] lg:aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                {currentArtwork?.watermarkedImage ? (
                  <img
                    src={currentArtwork.watermarkedImage}
                    alt={currentArtwork.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Palette className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Location ID Badges */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                <Badge className="bg-blue-600 text-white font-bold text-xs px-2 py-1">
                  G#{currentArtwork?.globalLocationId}
                </Badge>
                <Badge className="bg-green-600 text-white font-bold text-xs px-2 py-1">
                  A#{currentArtwork?.artistLocationId}
                </Badge>
              </div>

              {/* Image Toggle */}
              {currentArtwork?.originalImage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 hover:bg-white"
                  onClick={() => setShowOriginalImage(!showOriginalImage)}
                >
                  {showOriginalImage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
            </div>

            {/* Original Image Preview */}
            {showOriginalImage && currentArtwork?.originalImage && (
              <div className="aspect-square sm:aspect-[4/3] lg:aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={currentArtwork.originalImage}
                  alt={`${currentArtwork.title} (Original)`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={currentArtwork?.title || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">{currentArtwork?.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-sm font-medium text-gray-700">Year</Label>
                    {isEditing ? (
                      <Input
                        id="year"
                        type="number"
                        value={currentArtwork?.year || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("year", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium">{currentArtwork?.year}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="medium" className="text-sm font-medium text-gray-700">Medium</Label>
                    {isEditing ? (
                      <Input
                        id="medium"
                        value={currentArtwork?.medium || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("medium", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium">{currentArtwork?.medium}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  {isEditing ? (
                    <Input
                      id="dimensions"
                      value={currentArtwork?.dimensions || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("dimensions", e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 24 x 36 inches"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{currentArtwork?.dimensions || "Not specified"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={currentArtwork?.description || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Describe the artwork..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {currentArtwork?.description || "No description provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Pricing & Status</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price ($)</Label>
                  {isEditing ? (
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={currentArtwork?.price || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium text-lg">
                      ${currentArtwork?.price?.toLocaleString() || "0"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  {isEditing ? (
                    <Select
                      value={currentArtwork?.status || "Available"}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge 
                        variant={currentArtwork?.status === "Available" ? "default" : "secondary"}
                        className={
                          currentArtwork?.status === "Sold" ? "bg-green-600" :
                          currentArtwork?.status === "On Hold" ? "bg-yellow-600" :
                          currentArtwork?.status === "Draft" ? "bg-gray-600" : ""
                        }
                      >
                        {currentArtwork?.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="featured">Featured</Label>
                {isEditing ? (
                  <Select
                    value={currentArtwork?.featured ? "true" : "false"}
                    onValueChange={(value) => handleInputChange("featured", value === "true")}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    <Badge variant={currentArtwork?.featured ? "default" : "outline"}>
                      {currentArtwork?.featured ? "Featured" : "Not Featured"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Metadata</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Artist ID:</span>
                  <p>{currentArtwork?.artistId}</p>
                </div>
                <div>
                  <span className="font-medium">Artwork ID:</span>
                  <p>{currentArtwork?.id}</p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p>{currentArtwork?.createdAt ? new Date(currentArtwork.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Slug:</span>
                  <p className="font-mono text-xs">{currentArtwork?.slug || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 p-4 sm:p-6 lg:p-8 mt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Artwork
                  </Button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
