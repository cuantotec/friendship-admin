"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateArtworkLocation,
  toggleArtworkVisibility,
  deleteArtworkAdmin,
} from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface ArtworkActionsProps {
  artworkId: number;
  artworkTitle: string;
  currentLocation: string;
  isVisible: boolean;
}

export default function ArtworkActions({
  artworkId,
  artworkTitle,
  currentLocation,
  isVisible,
}: ArtworkActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleVisibility = () => {
    startTransition(async () => {
      const result = await toggleArtworkVisibility(artworkId);
      if (result.success) {
        toast.success("Visibility updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    });
  };

  const handleLocationChange = (location: string) => {
    startTransition(async () => {
      const result = await updateArtworkLocation(artworkId, location);
      if (result.success) {
        toast.success("Location updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update location");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${artworkTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteArtworkAdmin(artworkId);
      if (result.success) {
        toast.success("Artwork deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete artwork");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentLocation}
        onValueChange={handleLocationChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Gallery">Gallery</SelectItem>
          <SelectItem value="Storage">Storage</SelectItem>
          <SelectItem value="On Loan">On Loan</SelectItem>
          <SelectItem value="Private">Private</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleVisibility}
        disabled={isPending}
      >
        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

