"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Eye, EyeOff, DollarSign, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import ArtworkModal from "../artwork-modal";
import type { ArtworkListItem, Artwork } from "@/types";

interface ArtworksCardsProps {
  artworks: ArtworkListItem[];
}

export default function ArtworksCards({ artworks }: ArtworksCardsProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showArtworkModal, setShowArtworkModal] = useState(false);

  if (artworks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No artworks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile-first grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Artwork Image */}
              <div className="relative h-48 w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
                {artwork.watermarkedImage ? (
                  <Image
                    src={artwork.watermarkedImage}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Palette className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {artwork.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-white text-xs">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Artwork Info */}
              <div className="space-y-3">
                {/* Title and Artist */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    by {artwork.artistName || "Unknown Artist"}
                  </p>
                </div>

                {/* Year and Medium */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{artwork.year}</span>
                  <span className="mx-2">•</span>
                  <span className="truncate">{artwork.medium}</span>
                </div>

                {/* Dimensions */}
                <p className="text-sm text-gray-600">
                  {artwork.dimensions}
                </p>

                {/* Description - truncated for card view */}
                {artwork.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {artwork.description}
                  </p>
                )}

                {/* Price and Status Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-lg font-bold text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{parseFloat(artwork.price).toLocaleString()}</span>
                  </div>
                  
                  <Badge
                    variant={
                      artwork.status === "Available" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {artwork.status}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{artwork.location}</span>
                </div>

                {/* Visibility Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    {artwork.isVisible ? (
                      <><Eye className="h-4 w-4 mr-1 text-green-600" /><span className="text-green-600">Visible</span></>
                    ) : (
                      <><EyeOff className="h-4 w-4 mr-1 text-gray-400" /><span className="text-gray-400">Hidden</span></>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Convert ArtworkListItem to Artwork for the modal
                      const artworkData: Artwork = {
                        id: artwork.id,
                        title: artwork.title,
                        slug: artwork.slug || '',
                        artistId: artwork.artistId,
                        year: artwork.year,
                        medium: artwork.medium,
                        dimensions: artwork.dimensions,
                        widthCm: artwork.widthCm,
                        heightCm: artwork.heightCm,
                        depthCm: artwork.depthCm,
                        description: artwork.description,
                        price: artwork.price,
                        status: artwork.status,
                        location: artwork.location,
                        originalImage: artwork.originalImage,
                        watermarkedImage: artwork.watermarkedImage,
                        isVisible: artwork.isVisible,
                        featured: artwork.featured,
                        createdAt: new Date(artwork.createdAt),
                        // Add missing required fields
                        privateImages: [],
                        show3D: false,
                        artistDisplayOrder: 0,
                        globalDisplayOrder: 0,
                        has3dModel: false,
                        model3dUrl: null,
                        studioVisualizationUrl: null,
                        hasStudioVisualization: false,
                        isSculpture: false,
                        watermarkedImagesHistory: [],
                        isFramed: false,
                        approvalStatus: artwork.approvalStatus
                      };
                      setSelectedArtwork(artworkData);
                      setShowArtworkModal(true);
                    }}
                    className="w-full"
                  >
                    View Details & Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Artwork Modal */}
      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={showArtworkModal}
        onClose={() => {
          setShowArtworkModal(false);
          setSelectedArtwork(null);
        }}
        onArtworkUpdated={(updatedArtwork) => {
          // Refresh the page to show updated data
          window.location.reload();
        }}
        onArtworkDeleted={(artworkId) => {
          // Refresh the page to show updated data
          window.location.reload();
        }}
        artistId={selectedArtwork?.artistId || 0}
        mode="edit"
        isAdmin={true}
      />
    </div>
  );
}
