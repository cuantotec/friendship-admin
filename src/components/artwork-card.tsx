import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Artwork } from "@/lib/schema";
import { Palette, Calendar, Ruler, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const imageUrl = artwork.watermarkedImage || artwork.originalImage;
  
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="aspect-square relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Palette className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={artwork.status === "Available" ? "default" : "secondary"}
            className="text-xs"
          >
            {artwork.status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {artwork.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {artwork.description}
          </p>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{artwork.year}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="line-clamp-1">{artwork.medium}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            <span className="line-clamp-1">{artwork.dimensions}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">${artwork.price}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{artwork.location}</span>
          </div>
        </div>
        
        {/* Special Features */}
        <div className="flex flex-wrap gap-1">
          {artwork.isSculpture && (
            <Badge variant="outline" className="text-xs">
              3D Sculpture
            </Badge>
          )}
          {artwork.has3dModel && (
            <Badge variant="outline" className="text-xs">
              AR Model
            </Badge>
          )}
          {artwork.isFramed && (
            <Badge variant="outline" className="text-xs">
              Framed
            </Badge>
          )}
          {artwork.featured !== null && artwork.featured > 0 && (
            <Badge variant="outline" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
