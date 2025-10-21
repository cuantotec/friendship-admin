import { getAllArtworks, getPendingArtworks, getAllArtists } from "@/lib/actions/admin-actions";
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
  searchParams: Promise<SearchParams>;
}) {
  const allArtworks = await getAllArtworks();
  const pendingArtworks = await getPendingArtworks();
  const allArtists = await getAllArtists();
  const params = await searchParams;

  // Server-side filtering
  const filteredArtworks = allArtworks.filter((artwork) => {
    const matchesSearch =
      !params.search ||
      artwork.title.toLowerCase().includes(params.search.toLowerCase()) ||
      artwork.artistName?.toLowerCase().includes(params.search.toLowerCase());
    
    const matchesStatus =
      !params.status ||
      params.status === "all" ||
      artwork.status === params.status;
    
    const matchesLocation =
      !params.location ||
      params.location === "all" ||
      artwork.location === params.location;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations from server
  const locations = Array.from(new Set(allArtworks.map((a) => a.location)));

  // Calculate stats on server
  const stats = {
    total: allArtworks.length,
    visible: allArtworks.filter((a) => a.isVisible).length,
    hidden: allArtworks.filter((a) => !a.isVisible).length,
    pending: pendingArtworks.length,
    worth: allArtworks.reduce((sum, a) => sum + parseFloat(a.price), 0),
  };

  return (
    <div className="space-y-6">
      {/* Client component for interactive features */}
      <ArtworksPageClient 
        artworks={filteredArtworks} 
        pendingArtworks={pendingArtworks}
        stats={stats} 
        locations={locations}
        artists={allArtists.map(artist => ({
          id: artist.id,
          name: artist.name,
          email: artist.email
        }))}
      />
    </div>
  );
}
