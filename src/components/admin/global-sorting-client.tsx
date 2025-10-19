"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Shuffle, 
  Save, 
  Loader2, 
  CheckCircle, 
  XCircle,
  GripVertical,
  Eye,
  EyeOff,
  Palette
} from "lucide-react";
import Image from "next/image";
import { updateGlobalDisplayOrders, generateRandomDisplayOrders } from "@/lib/actions/global-sorting-actions";
import type { ArtworkForSorting, GlobalSortingUpdate } from "@/lib/actions/global-sorting-actions";

interface GlobalSortingClientProps {
  artworks: ArtworkForSorting[];
}

export default function GlobalSortingClient({ artworks: initialArtworks }: GlobalSortingClientProps) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  // Sort artworks by global display order (lower values = displayed first)
  // This matches the actual display order in the gallery
  const sortedArtworks = [...artworks].sort((a, b) => a.globalDisplayOrder - b.globalDisplayOrder);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    
    if (dragIndex === dropIndex) return;

    const newArtworks = [...sortedArtworks];
    const draggedItem = newArtworks[dragIndex];
    
    // Remove the dragged item
    newArtworks.splice(dragIndex, 1);
    
    // Insert at new position
    newArtworks.splice(dropIndex, 0, draggedItem);
    
    // Update display orders based on new positions (position 1 = order 1, position 2 = order 2, etc.)
    const updatedArtworks = newArtworks.map((artwork, index) => ({
      ...artwork,
      globalDisplayOrder: index + 1
    }));
    
    // Update the artworks state with the new order
    setArtworks(updatedArtworks);
    setHasChanges(true);
  };

  const handleSave = () => {
    const updates: GlobalSortingUpdate[] = sortedArtworks.map((artwork, index) => ({
      id: artwork.id,
      globalDisplayOrder: index + 1
    }));

    startTransition(async () => {
      const result = await updateGlobalDisplayOrders(updates);
      
      if (result.success) {
        toast.success("Display order updated successfully!", {
          description: `Updated ${result.data?.updatedCount} artworks`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        setHasChanges(false);
        // Refresh the page to show the updated order
        window.location.reload();
      } else {
        toast.error("Failed to update display order", {
          description: result.error || "An error occurred",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    });
  };

  const handleGenerateRandom = () => {
    if (!confirm(`This will generate unique random display order values (1-${artworks.length}) for all artworks. Continue?`)) {
      return;
    }

    startTransition(async () => {
      const result = await generateRandomDisplayOrders();
      
      if (result.success) {
        toast.success("Unique random display orders generated!", {
          description: `Updated ${result.data?.updatedCount} artworks with values 1-${artworks.length}`,
          icon: <CheckCircle className="h-4 w-4" />
        });
        // Refresh the page to show new data
        window.location.reload();
      } else {
        toast.error("Failed to generate random orders", {
          description: result.error || "An error occurred",
          icon: <XCircle className="h-4 w-4" />
        });
      }
    });
  };

  if (artworks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No artworks found</h3>
          <p className="mt-1 text-sm text-gray-500">Add some artworks to enable sorting</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleGenerateRandom}
          disabled={isPending}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
          Generate Random Order
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Drag and drop artworks to reorder them</li>
          <li>• Position 1 (top) = Order: 1 = displayed first in the gallery</li>
          <li>• Position 2 (second) = Order: 2 = displayed second in the gallery</li>
          <li>• Click &quot;Generate Random Order&quot; to assign unique random values (1-{artworks.length})</li>
          <li>• Click &quot;Save Changes&quot; to apply your new order</li>
        </ul>
      </div>

      {/* Artworks List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Artworks ({sortedArtworks.length})
        </h3>
        
        <div className="space-y-2">
          {sortedArtworks.map((artwork, index) => (
            <Card
              key={artwork.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="cursor-move hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Position Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {index + 1}
                    </span>
                  </div>

                  {/* Artwork Image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {artwork.watermarkedImage ? (
                      <Image
                        src={artwork.watermarkedImage}
                        alt={artwork.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Palette className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Artwork Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {artwork.title}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {artwork.artistName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Order: {artwork.globalDisplayOrder}
                      </Badge>
                      <Badge 
                        variant={artwork.isVisible ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {artwork.isVisible ? (
                          <><Eye className="h-3 w-3 mr-1" /> Visible</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Hidden</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
