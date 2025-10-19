"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateArtworkApprovalStatus, approveAllPendingArtworks } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Clock,
  Palette,
  User,
  Calendar,
  DollarSign,
  MapPin,
  CheckCheck,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import type { ArtworkListItem } from "@/types";

interface PendingArtworksTabProps {
  pendingArtworks: ArtworkListItem[];
  onArtworkUpdated: () => void;
}

export default function PendingArtworksTab({ 
  pendingArtworks, 
  onArtworkUpdated 
}: PendingArtworksTabProps) {
  const [isPending, startTransition] = useTransition();
  const [processingArtworkId, setProcessingArtworkId] = useState<number | null>(null);
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  const handleApprove = (artworkId: number, isVisible: boolean = true) => {
    setProcessingArtworkId(artworkId);
    startTransition(async () => {
      const result = await updateArtworkApprovalStatus(artworkId, 'approved', isVisible);
      if (result.success) {
        toast.success(`Artwork approved and ${isVisible ? 'made visible' : 'kept hidden'}`);
        onArtworkUpdated();
      } else {
        toast.error(result.error || "Failed to approve artwork");
      }
      setProcessingArtworkId(null);
    });
  };

  const handleReject = (artworkId: number) => {
    setProcessingArtworkId(artworkId);
    startTransition(async () => {
      const result = await updateArtworkApprovalStatus(artworkId, 'rejected');
      if (result.success) {
        toast.success("Artwork rejected");
        onArtworkUpdated();
      } else {
        toast.error(result.error || "Failed to reject artwork");
      }
      setProcessingArtworkId(null);
    });
  };

  const handleApproveAll = (isVisible: boolean = true) => {
    if (pendingArtworks.length === 0) return;
    
    const action = isVisible ? 'approve and make visible' : 'approve but keep hidden';
    const confirmed = confirm(
      `Are you sure you want to ${action} all ${pendingArtworks.length} pending artworks? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsBulkApproving(true);
    startTransition(async () => {
      const result = await approveAllPendingArtworks(isVisible);
      if (result.success) {
        toast.success(`${result.data.updatedCount} artworks approved and ${isVisible ? 'made visible' : 'kept hidden'}`);
        onArtworkUpdated();
      } else {
        toast.error(result.error || "Failed to approve artworks");
      }
      setIsBulkApproving(false);
    });
  };

  if (pendingArtworks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Artworks</h3>
        <p className="text-gray-500">All artworks have been reviewed and approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pending Artworks</h2>
              <p className="text-sm text-gray-600">
                {pendingArtworks.length} artwork{pendingArtworks.length !== 1 ? 's' : ''} awaiting approval
              </p>
            </div>
          </div>
          
          {pendingArtworks.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleApproveAll(true)}
                disabled={isBulkApproving || isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Approve All & Show
              </Button>
              <Button
                onClick={() => handleApproveAll(false)}
                disabled={isBulkApproving || isPending}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                size="sm"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Approve All & Hide
              </Button>
            </div>
          )}
        </div>
        
        {pendingArtworks.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Bulk Actions:</span>
              <span>Use the buttons above to approve all pending artworks at once. Individual actions are available on each artwork card.</span>
            </div>
          </div>
        )}
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingArtworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-400 bg-gradient-to-br from-white to-yellow-50/30">
            <CardHeader className="p-0">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-100">
                {artwork.watermarkedImage ? (
                  <Image
                    src={artwork.watermarkedImage}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Palette className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {/* Title and Artist */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 truncate">{artwork.title}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {artwork.artistName || "Unknown Artist"}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>{artwork.year}</span>
                  <span>•</span>
                  <span>{artwork.medium}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-3 w-3" />
                  <span>${parseFloat(artwork.price).toLocaleString()}</span>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{artwork.location}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Dimensions:</span> {artwork.dimensions}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                {artwork.description}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(artwork.id, true)}
                  disabled={isPending && processingArtworkId === artwork.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve & Show
                </Button>
                <Button
                  onClick={() => handleApprove(artwork.id, false)}
                  disabled={isPending && processingArtworkId === artwork.id}
                  variant="outline"
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200"
                  size="sm"
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Approve & Hide
                </Button>
                <Button
                  onClick={() => handleReject(artwork.id)}
                  disabled={isPending && processingArtworkId === artwork.id}
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                  size="sm"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
