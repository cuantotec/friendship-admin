import { getAllArtworks } from "@/lib/actions/admin-actions";
import ArtworksTable from "@/components/admin/artworks-table";
import ArtworksFilters from "@/components/admin/artworks-filters";
import ArtworksPageClient from "@/components/admin/artworks-page-client";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  status?: string;
  location?: string;
}

export default async function AdminArtworksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const allArtworks = await getAllArtworks();

  // Server-side filtering
  const filteredArtworks = allArtworks.filter((artwork) => {
    const matchesSearch =
      !searchParams.search ||
      artwork.title.toLowerCase().includes(searchParams.search.toLowerCase()) ||
      artwork.artistName?.toLowerCase().includes(searchParams.search.toLowerCase());
    
    const matchesStatus =
      !searchParams.status ||
      searchParams.status === "all" ||
      artwork.status === searchParams.status;
    
    const matchesLocation =
      !searchParams.location ||
      searchParams.location === "all" ||
      artwork.location === searchParams.location;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations from server
  const locations = Array.from(new Set(allArtworks.map((a) => a.location)));

  // Calculate stats on server
  const stats = {
    total: allArtworks.length,
    visible: allArtworks.filter((a) => a.isVisible).length,
    hidden: allArtworks.filter((a) => !a.isVisible).length,
    worth: allArtworks.reduce((sum, a) => sum + parseFloat(a.price), 0),
  };

  return (
    <div className="space-y-6">
      {/* Client component for interactive features */}
      <ArtworksPageClient 
        artworks={filteredArtworks} 
        stats={stats} 
        locations={locations} 
      />

      {/* Filters - Client component for form interaction only */}
      <ArtworksFilters locations={locations} />

      {/* Table - Server-rendered with server actions */}
      <ArtworksTable artworks={filteredArtworks} />
    </div>
  );
}
