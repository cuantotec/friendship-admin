"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateArtwork, deleteArtwork, createArtwork } from "@/lib/actions/artwork-actions";
import { artworkSchema } from "@/lib/validations/artwork";
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
  XCircle,
  Upload,
  Image as ImageIcon,
  X,
  Star
} from "lucide-react";
import type { Artwork, ArtworkWithDisplayOrder } from "@/types";

interface ArtworkModalProps {
  artwork: Artwork | ArtworkWithDisplayOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onArtworkUpdated: (artwork: Artwork) => void;
  onArtworkDeleted: (artworkId: number) => void;
  artistId: number; // Required for creating new artworks
  mode?: 'edit' | 'create'; // Determines if modal is for editing or creating
  isAdmin?: boolean; // Determines if user is admin (can edit featured status)
  artists?: Array<{ id: number; name: string; email?: string | null }>; // List of artists for admin dropdown
}

export default function ArtworkModal({ 
  artwork, 
  isOpen, 
  onClose, 
  onArtworkUpdated,
  onArtworkDeleted,
  artistId,
  mode = artwork ? 'edit' : 'create',
  isAdmin = false,
  artists = []
}: ArtworkModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [editedArtwork, setEditedArtwork] = useState<Partial<Artwork & ArtworkWithDisplayOrder> | null>(null);
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<number>(artistId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation function
  const validateForm = (artworkData: Partial<Artwork & ArtworkWithDisplayOrder>) => {
    try {
      const validatedData = artworkSchema.parse(artworkData);
      setValidationErrors({});
      return { isValid: true, data: validatedData, errors: {} };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const errors: Record<string, string[]> = {};
        (error as { errors: Array<{ path: string[]; message: string }> }).errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });
        setValidationErrors(errors);
        return { isValid: false, data: null, errors };
      }
      setValidationErrors({});
      return { isValid: false, data: null, errors: {} };
    }
  };

  // Initialize edited artwork when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        // Initialize with empty artwork for creation
        setEditedArtwork({
          title: '',
          year: '',
          medium: '',
          dimensions: '',
          widthCm: null,
          heightCm: null,
          depthCm: null,
          description: '',
          price: '0',
          status: 'Draft',
          featured: 0,
          artistId: selectedArtistId
        });
        setIsEditing(true);
        setImageFile(null);
        setImagePreview(null);
        setValidationErrors({});
        setIsSubmitting(false);
      } else if (artwork) {
        setEditedArtwork({ ...artwork });
        setSelectedArtistId(artwork.artistId);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
        setValidationErrors({});
        setIsSubmitting(false);
      }
    }
  }, [artwork, isOpen, mode, selectedArtistId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedArtwork({ ...artwork });
  };

  const handleCancel = () => {
    if (mode === 'create') {
      onClose();
    } else {
      setIsEditing(false);
      setEditedArtwork(artwork ? { ...artwork } : null);
      setImageFile(null);
      setImagePreview(null);
    }
    setValidationErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | number | boolean | null) => {
    if (!editedArtwork) return;
    
    const updatedArtwork = {
      ...editedArtwork,
      [field]: value
    };
    
    setEditedArtwork(updatedArtwork);
    
    // Real-time validation
    validateForm(updatedArtwork);
  };

  const handleArtistChange = (artistId: number) => {
    setSelectedArtistId(artistId);
    if (editedArtwork) {
      const updatedArtwork = {
        ...editedArtwork,
        artistId: artistId
      };
      setEditedArtwork(updatedArtwork);
      validateForm(updatedArtwork);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file (JPEG, PNG, GIF, or WebP)',
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please select an image smaller than 10MB',
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<{ originalUrl: string; watermarkedUrl: string } | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    const uploadToast = toast.loading('Uploading image...', {
      description: 'Please wait while we upload and watermark your image.'
    });

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      toast.dismiss(uploadToast);
      toast.success('Image uploaded successfully!', {
        description: 'Watermark has been applied.',
        icon: <CheckCircle className="h-4 w-4" />
      });

      return {
        originalUrl: data.originalUrl,
        watermarkedUrl: data.watermarkedUrl
      };
    } catch (error) {
      toast.dismiss(uploadToast);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Failed to upload image',
        icon: <XCircle className="h-4 w-4" />
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editedArtwork || isSubmitting) return;

    // Check if artistId is valid
    const currentArtistId = isAdmin ? selectedArtistId : artistId;
    if (!currentArtistId || currentArtistId <= 0) {
      toast.error('Invalid artist ID', {
        description: isAdmin ? 'Please select an artist' : 'Please contact an administrator to set up your artist profile',
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    // Prevent multiple submissions
    setIsSubmitting(true);
    setIsLoading(true);

    // Comprehensive validation using Zod
    const validation = validateForm(editedArtwork);
    if (!validation.isValid) {
      // Show all validation errors
      const errorMessages = Object.values(validationErrors).flat();
      toast.error('Please fix all form errors', {
        description: errorMessages.join(', '),
        icon: <XCircle className="h-4 w-4" />
      });
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }
    
    const loadingToast = toast.loading(
      mode === 'create' ? 'Creating artwork...' : 'Saving artwork changes...',
      { description: 'Please wait while we update your artwork.' }
    );
    
    try {
      let originalImage = editedArtwork.originalImage;
      let watermarkedImage = editedArtwork.watermarkedImage;

      // Upload image if a new one was selected
      if (imageFile) {
        const uploadResult = await uploadImage();
        if (uploadResult) {
          originalImage = uploadResult.originalUrl;
          watermarkedImage = uploadResult.watermarkedUrl;
        } else {
          toast.dismiss(loadingToast);
          toast.error('Image upload failed', {
            description: 'Please try again',
            icon: <XCircle className="h-4 w-4" />
          });
          setIsLoading(false);
          return;
        }
      }

      const artworkData = {
        ...editedArtwork,
        originalImage,
        watermarkedImage,
        artistId: mode === 'create' ? currentArtistId : editedArtwork.artistId
      };

      let result;
      if (mode === 'create') {
        result = await createArtwork(artworkData);
      } else if (artwork?.id) {
        result = await updateArtwork(artwork.id, artworkData);
      } else {
        throw new Error('Invalid artwork ID');
      }
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(
          mode === 'create' ? 'Artwork created successfully!' : 'Artwork updated successfully!',
          {
            description: `"${editedArtwork.title}" has been saved.`,
            icon: <CheckCircle className="h-4 w-4" />
          }
        );
        onArtworkUpdated(result.data);
        setIsEditing(false);
        if (mode === 'create') {
          onClose();
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          mode === 'create' ? 'Failed to create artwork' : 'Failed to update artwork',
          {
            description: result.error,
            icon: <XCircle className="h-4 w-4" />
          }
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        mode === 'create' ? 'Failed to create artwork' : 'Failed to update artwork',
        {
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          icon: <XCircle className="h-4 w-4" />
        }
      );
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!artwork || !artwork.id || mode === 'create') return;

    if (!window.confirm("Are you sure you want to delete this artwork? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    
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


  const currentArtwork = isEditing ? editedArtwork : artwork;
  const displayImage = imagePreview || currentArtwork?.watermarkedImage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-white p-0 m-4 sm:m-6 lg:m-8 animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Artwork' : isEditing ? 'Edit Artwork' : 'Artwork Details'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && mode === 'edit' && (
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
              <div className="aspect-square sm:aspect-[4/3] lg:aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm relative">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={currentArtwork?.title || 'Artwork'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Palette className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Location ID Badges - only show for existing artworks */}
              {mode === 'edit' && currentArtwork && 'globalLocationId' in currentArtwork && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <Badge className="bg-blue-600 text-white font-bold text-xs px-2 py-1">
                    G#{(currentArtwork as ArtworkWithDisplayOrder).globalLocationId}
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold text-xs px-2 py-1">
                    A#{(currentArtwork as ArtworkWithDisplayOrder).artistLocationId}
                  </Badge>
                </div>
              )}

              {/* Image Toggle - only for existing artwork with original image */}
              {mode === 'edit' && currentArtwork?.originalImage && !imagePreview && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 hover:bg-white"
                  onClick={() => setShowOriginalImage(!showOriginalImage)}
                >
                  {showOriginalImage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}

              {/* Image preview badge */}
              {imagePreview && (
                <Badge className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-600 text-white">
                  New Image
                </Badge>
              )}
            </div>

            {/* Image Upload Section - only in edit mode */}
            {isEditing && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : imageFile ? (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {imageFile.name}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {mode === 'create' ? 'Upload Artwork Image' : 'Change Image'}
                    </>
                  )}
                </Button>
                {imageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Selected Image
                  </Button>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Image will be watermarked automatically upon upload
                </p>
              </div>
            )}

            {/* Original Image Preview */}
            {showOriginalImage && currentArtwork?.originalImage && !imagePreview && (
              <div className="aspect-square sm:aspect-[4/3] lg:aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm relative">
                <Image
                  src={currentArtwork.originalImage}
                  alt={`${currentArtwork.title} (Original)`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={currentArtwork?.title || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                      className={`mt-1 ${validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="Enter artwork title"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">{currentArtwork?.title}</p>
                  )}
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.title[0]}</p>
                  )}
                </div>

                {/* Artist Selection - Only show for admins in create mode */}
                {isAdmin && mode === 'create' && (
                  <div>
                    <Label htmlFor="artist" className="text-sm font-medium text-gray-700">Artist <span className="text-red-500">*</span></Label>
                    <Select value={selectedArtistId.toString()} onValueChange={(value) => handleArtistChange(parseInt(value))}>
                      <SelectTrigger className={`mt-1 ${validationErrors.artistId ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select an artist" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id.toString()}>
                            {artist.name} {artist.email && `(${artist.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.artistId && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.artistId[0]}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-sm font-medium text-gray-700">Year</Label>
                    {isEditing ? (
                      <Input
                        id="year"
                        type="number"
                        value={currentArtwork?.year || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("year", e.target.value)}
                        className={`mt-1 ${validationErrors.year ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="e.g., 2024"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium">{currentArtwork?.year}</p>
                    )}
                    {validationErrors.year && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.year[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="medium" className="text-sm font-medium text-gray-700">Medium</Label>
                    {isEditing ? (
                      <Input
                        id="medium"
                        value={currentArtwork?.medium || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("medium", e.target.value)}
                        className={`mt-1 ${validationErrors.medium ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="e.g., Oil on canvas"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium">{currentArtwork?.medium}</p>
                    )}
                    {validationErrors.medium && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.medium[0]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dimensions">Display Dimensions</Label>
                  {isEditing ? (
                    <Input
                      id="dimensions"
                      value={currentArtwork?.dimensions || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("dimensions", e.target.value)}
                      className={`mt-1 ${validationErrors.dimensions ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="e.g., 24 x 36 inches"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{currentArtwork?.dimensions || "Not specified"}</p>
                  )}
                  {validationErrors.dimensions && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.dimensions[0]}</p>
                  )}
                </div>

                {/* 3D Dimensions Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">3D Dimensions (for AR/3D display)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="widthCm">Width (cm)</Label>
                      {isEditing ? (
                        <Input
                          id="widthCm"
                          type="number"
                          step="0.1"
                          value={currentArtwork?.widthCm || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("widthCm", e.target.value)}
                          className="mt-1"
                          placeholder="e.g., 60.5"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{currentArtwork?.widthCm ? `${currentArtwork.widthCm} cm` : "Not specified"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="heightCm">Height (cm)</Label>
                      {isEditing ? (
                        <Input
                          id="heightCm"
                          type="number"
                          step="0.1"
                          value={currentArtwork?.heightCm || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("heightCm", e.target.value)}
                          className="mt-1"
                          placeholder="e.g., 91.4"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{currentArtwork?.heightCm ? `${currentArtwork.heightCm} cm` : "Not specified"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="depthCm">Depth (cm)</Label>
                      {isEditing ? (
                        <Input
                          id="depthCm"
                          type="number"
                          step="0.1"
                          value={currentArtwork?.depthCm || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("depthCm", e.target.value)}
                          className="mt-1"
                          placeholder="e.g., 2.5"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{currentArtwork?.depthCm ? `${currentArtwork.depthCm} cm` : "Not specified"}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={currentArtwork?.description || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                      className={`mt-1 ${validationErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                      rows={4}
                      placeholder="Describe the artwork..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {currentArtwork?.description || "No description provided"}
                    </p>
                  )}
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.description[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Pricing & Status</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Price ($) <span className="text-xs text-gray-500">(max: $100,000)</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100000"
                      value={currentArtwork?.price || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseFloat(e.target.value) || 0;
                        const limitedValue = Math.min(value, 100000);
                        handleInputChange("price", limitedValue.toString());
                      }}
                      className={`mt-1 ${validationErrors.price ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium text-lg">
                      ${parseFloat(currentArtwork?.price || "0").toLocaleString()}
                    </p>
                  )}
                  {validationErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.price[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  {isEditing ? (
                    <Select
                      value={currentArtwork?.status || "Available"}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className={`mt-1 bg-white ${validationErrors.status ? 'border-red-500 focus:border-red-500' : ''}`}>
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
                  {validationErrors.status && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.status[0]}</p>
                  )}
                </div>
              </div>

              {/* Featured Toggle - Admin Only */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <Label htmlFor="featured" className="text-sm font-semibold text-yellow-800">
                      Featured Artwork
                    </Label>
                  </div>
                  <p className="text-xs text-yellow-700 mb-3">
                    Featured artworks appear prominently on the homepage and gallery
                  </p>
                  {isEditing ? (
                    <Select
                      value={currentArtwork?.featured ? "true" : "false"}
                      onValueChange={(value) => handleInputChange("featured", value === "true")}
                    >
                      <SelectTrigger className="bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="true" className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Yes - Make Featured
                        </SelectItem>
                        <SelectItem value="false" className="flex items-center gap-2">
                          <X className="h-4 w-4 text-gray-500" />
                          No - Remove from Featured
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={currentArtwork?.featured ? "default" : "outline"}
                        className={`${
                          currentArtwork?.featured 
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        <Star className={`h-3 w-3 mr-1 ${
                          currentArtwork?.featured ? "text-yellow-600" : "text-gray-500"
                        }`} />
                        {currentArtwork?.featured ? "Featured" : "Not Featured"}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Metadata - only show for existing artworks */}
            {mode === 'edit' && (
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
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 p-4 sm:p-6 lg:p-8 mt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || isUploading || isSubmitting}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {mode === 'create' ? 'Create Artwork' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading || isUploading || isSubmitting}
                    className="w-full sm:w-auto border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Cancel
                  </Button>
                  {mode === 'edit' && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isLoading || isUploading || isSubmitting}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete Artwork
                    </Button>
                  )}
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
