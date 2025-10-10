"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArtworkModal from "./artwork-modal";
import { createArtwork } from "@/lib/actions/artwork-actions";
import { updateArtworkOrder } from "@/lib/actions/update-artwork-order";
import { toast } from "sonner";
import { 
  Palette, 
  BarChart3, 
  DollarSign,
  Grid,
  List,
  User,
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  GripVertical,
  Save
} from "lucide-react";

type Artist = any;
type Artwork = any;

interface ArtistDashboardProps {
  artist: Artist | null;
  artworks: Artwork[];
}

export default function ArtistDashboard({ artist, artworks }: ArtistDashboardProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggedArtwork, setDraggedArtwork] = useState<Artwork | null>(null);
  const [artworksOrder, setArtworksOrder] = useState<Artwork[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize artworks order when artworks change
  React.useEffect(() => {
    setArtworksOrder([...artworks]);
  }, [artworks]);

  const stats = [
    { name: "Total Artworks", value: artworksOrder.length.toString(), icon: Palette, change: "+0", changeType: "positive" },
    { name: "Available", value: artworksOrder.filter(a => a.status === "Available").length.toString(), icon: BarChart3, change: "+0", changeType: "positive" },
    { name: "Sold", value: artworksOrder.filter(a => a.status === "Sold").length.toString(), icon: DollarSign, change: "+0", changeType: "positive" },
    { name: "Total Value", value: `$${artworksOrder.reduce((sum, artwork) => sum + parseFloat(artwork.price.toString()), 0).toLocaleString()}`, icon: DollarSign, change: "+0", changeType: "positive" },
  ];

  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
  };

  const handleArtworkUpdated = (updatedArtwork: Artwork) => {
    console.log("Artwork updated:", updatedArtwork);
    // Refresh the page data to show updated artwork
    setIsRefreshing(true);
    router.refresh();
    handleModalClose();
  };

  const handleArtworkDeleted = (artworkId: number) => {
    console.log("Artwork deleted:", artworkId);
    // Refresh the page data to remove deleted artwork
    setIsRefreshing(true);
    router.refresh();
    handleModalClose();
  };

  const handleCreateArtwork = async () => {
    if (!artist?.id) {
      toast.error("Artist ID not found", {
        description: "Unable to create artwork without artist information.",
        icon: <XCircle className="h-4 w-4" />
      });
      return;
    }

    setIsCreating(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Creating new artwork...", {
      description: "Please wait while we create your artwork."
    });

    try {
      const newArtworkData = {
        title: "New Artwork",
        year: new Date().getFullYear().toString(),
        medium: "Oil on Canvas",
        dimensions: "24 x 36 inches",
        description: "A new artwork created by the artist.",
        price: 0,
        status: "Draft",
        featured: false,
        artistId: artist.id
      };

      const result = await createArtwork(newArtworkData);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Artwork created successfully!", {
          description: `"${result.data.title}" has been created.`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        
        // Open the modal with the new artwork for immediate editing
        setSelectedArtwork(result.data);
        setIsModalOpen(true);
        
        // Also refresh the page data to show new artwork in the list
        setIsRefreshing(true);
        router.refresh();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to create artwork", {
          description: result.error,
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create artwork", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleReloadArtworks = async () => {
    setIsReloading(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Reloading artworks...", {
      description: "Fetching latest artwork data."
    });

    try {
      // Refresh the page data
      router.refresh();
      
      // Show success toast after a short delay
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success("Artworks reloaded successfully!", {
          description: "Your artwork data has been updated.",
          icon: <CheckCircle className="h-4 w-4" />
        });
        setIsReloading(false);
      }, 1000);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to reload artworks", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
      setIsReloading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, artwork: Artwork) => {
    if (!isDragMode) return;
    setDraggedArtwork(artwork);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback for drop zones
    const target = e.currentTarget as HTMLElement;
    target.classList.add('ring-2', 'ring-purple-400', 'ring-opacity-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isDragMode) return;
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('ring-2', 'ring-purple-400', 'ring-opacity-50');
  };

  const handleDrop = (e: React.DragEvent, targetArtwork: Artwork) => {
    if (!isDragMode || !draggedArtwork) return;
    e.preventDefault();

    const draggedIndex = artworksOrder.findIndex(a => a.id === draggedArtwork.id);
    const targetIndex = artworksOrder.findIndex(a => a.id === targetArtwork.id);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedArtwork(null);
      return;
    }

    // Create new order
    const newOrder = [...artworksOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update artist location IDs based on new order
    const updatedOrder = newOrder.map((artwork, index) => ({
      ...artwork,
      artistLocationId: index + 1
    }));

    setArtworksOrder(updatedOrder);
    setHasChanges(true);
    setDraggedArtwork(null);
    
    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('ring-2', 'ring-purple-400', 'ring-opacity-50');
  };

  const handleDragEnd = () => {
    setDraggedArtwork(null);
  };

  const handleSaveOrder = async () => {
    if (!hasChanges) return;

    setIsReloading(true);
    
    const loadingToast = toast.loading("Saving artwork order...", {
      description: "Updating artwork positions in database."
    });

    try {
      // Prepare the updates for the server action
      const artworkUpdates = artworksOrder.map((artwork, index) => ({
        id: artwork.id,
        artistLocationId: index + 1
      }));

      console.log("Saving artwork order:", artworkUpdates);

      // Call the server action to update the database
      const result = await updateArtworkOrder(artworkUpdates);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Artwork order saved!", {
          description: `Updated ${result.data.updatedCount} artwork positions.`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        
        // Refresh the data to get the updated order from the database
        router.refresh();
        
        setHasChanges(false);
        setIsDragMode(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to save order", {
          description: result.error,
          icon: <XCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save order", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        icon: <XCircle className="h-4 w-4" />
      });
    } finally {
      setIsReloading(false);
    }
  };

  const handleCancelDrag = () => {
    setArtworksOrder([...artworks]);
    setHasChanges(false);
    setIsDragMode(false);
    setDraggedArtwork(null);
  };

  return (
    <div className="space-y-8 relative">
      {(isRefreshing || isReloading) && (
        <div className="absolute top-0 right-0 z-10 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isReloading ? "Reloading artworks..." : "Refreshing data..."}</span>
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage your artist profile and artworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button 
              onClick={handleCreateArtwork}
              disabled={isCreating}
              className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Plus className="h-6 w-6 mb-2" />
              )}
              <span className="font-medium">Add New Artwork</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300">
              <User className="h-6 w-6 mb-2 text-blue-600" />
              <span className="font-medium">Edit Profile</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col rounded-xl hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-400">
              <Settings className="h-6 w-6 mb-2 text-gray-600" />
              <span className="font-medium">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Artist Profile & Artworks */}
      {artist && (
        <div className="space-y-8">
          {/* Artist Profile */}
          <Card className="border-gray-200">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  {artist.profileImage ? (
                    <img
                      src={artist.profileImage}
                      alt={artist.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {artist.name}
                  </h2>
                  {artist.bio && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {artist.bio}
                    </p>
                  )}
                  {artist.specialty && (
                    <Badge variant="secondary" className="text-sm">
                      {artist.specialty}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artworks Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  My Artworks
                </h2>
                <p className="text-gray-600">
                  View and manage your artwork collection
                </p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Drag & Drop Toggle */}
                <Button
                  variant={isDragMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDragMode(!isDragMode)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    isDragMode 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 hover:text-purple-700"
                  }`}
                >
                  <GripVertical className="w-4 h-4" />
                  <span className="hidden sm:inline">{isDragMode ? "Exit Drag" : "Drag & Drop"}</span>
                </Button>

                {/* Save Order Button - only show when in drag mode with changes */}
                {isDragMode && hasChanges && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveOrder}
                    disabled={isReloading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isReloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Save Order</span>
                  </Button>
                )}

                {/* Cancel Button - only show when in drag mode with changes */}
                {isDragMode && hasChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelDrag}
                    disabled={isReloading}
                    className="flex items-center gap-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                )}

                {/* Reload Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReloadArtworks}
                  disabled={isReloading}
                  className="flex items-center gap-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                >
                  {isReloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Reload</span>
                </Button>
                
                {/* View Mode Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {artworksOrder.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Palette className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No artworks found
                  </h3>
                  <p className="text-gray-600">
                    You haven&apos;t uploaded any artworks yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {/* Drag Mode Indicator */}
                {isDragMode && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-purple-700">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-sm font-medium">Drag Mode Active</span>
                    <span className="text-xs text-purple-600">- Drag artworks to reorder them</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">My Artworks</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-1">G#</Badge>
                      <span>Global Order</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-1">A#</Badge>
                      <span>Artist Order</span>
                    </div>
                  </div>
                </div>
                
                {/* Artworks Grid/List */}
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                    : "space-y-4"
                }>
                  {artworksOrder.map((artwork) => (
                    <div 
                      key={artwork.id} 
                      draggable={isDragMode}
                      onDragStart={(e) => handleDragStart(e, artwork)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, artwork)}
                      onDragEnd={handleDragEnd}
                      className={`relative group transition-all duration-200 ${
                        isDragMode 
                          ? 'cursor-grab active:cursor-grabbing' 
                          : 'cursor-pointer hover:shadow-lg'
                      } ${viewMode === 'list' ? 'flex items-center space-x-4 p-4 border rounded-lg' : ''} ${
                        draggedArtwork?.id === artwork.id ? 'opacity-50 scale-95' : ''
                      } ${isDragMode ? 'hover:scale-105' : ''}`}
                      onClick={() => !isDragMode && handleArtworkClick(artwork)}
                    >
                      {/* Location ID Badges */}
                      <div className={`${viewMode === 'list' ? 'absolute top-2 left-2' : 'absolute top-2 left-2'} z-10 flex gap-1`}>
                        <Badge className="bg-blue-600 text-white text-xs font-bold px-2 py-1">
                          G#{artwork.globalLocationId}
                        </Badge>
                        <Badge className="bg-green-600 text-white text-xs font-bold px-2 py-1">
                          A#{artwork.artistLocationId}
                        </Badge>
                      </div>

                      {/* Drag Handle - only show in drag mode */}
                      {isDragMode && (
                        <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white p-1 rounded-full">
                          <GripVertical className="h-3 w-3" />
                        </div>
                      )}

                      <div className={`${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'} bg-gray-100 rounded-lg overflow-hidden`}>
                        {artwork.watermarkedImage ? (
                          <img
                            src={artwork.watermarkedImage}
                            alt={artwork.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Palette className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-2'}`}>
                        <h5 className="text-sm font-medium text-gray-900 truncate">{artwork.title}</h5>
                        <p className="text-xs text-gray-500">{artwork.year} • {artwork.medium}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {artwork.status}
                          </Badge>
                          <span className="text-xs font-medium text-green-600">${artwork.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artwork Modal */}
      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onArtworkUpdated={handleArtworkUpdated}
        onArtworkDeleted={handleArtworkDeleted}
      />
    </div>
  );
}
