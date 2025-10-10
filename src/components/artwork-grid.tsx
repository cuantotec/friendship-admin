import { Artwork } from "@/lib/schema";
import { ArtworkCard } from "./artwork-card";
import { Palette } from "lucide-react";

interface ArtworkGridProps {
  artworks: Artwork[];
  artistName?: string;
}

export function ArtworkGrid({ artworks, artistName }: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Palette className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No artworks found
        </h3>
        <p className="text-gray-600">
          {artistName 
            ? `${artistName} hasn't uploaded any artworks yet.`
            : "You haven't uploaded any artworks yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
