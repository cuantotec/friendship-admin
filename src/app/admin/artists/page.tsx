import { getAllArtists } from "@/lib/actions/admin-actions";
import ArtistsTable from "@/components/admin/artists-table";
import ArtistsFilters from "@/components/admin/artists-filters";
import ArtistsPageClient from "@/components/admin/artists-page-client";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
}

export default async function AdminArtistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const allArtists = await getAllArtists();
  const params = await searchParams;

  // Server-side filtering
  const filteredArtists = allArtists.filter((artist) => {
    if (!params.search) return true;
    
    const searchLower = params.search.toLowerCase();
    return (
      artist.name.toLowerCase().includes(searchLower) ||
      artist.email?.toLowerCase().includes(searchLower) ||
      artist.specialty?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats on server
  const stats = {
    total: allArtists.length,
    visible: allArtists.filter((a) => a.isVisible).length,
    featured: allArtists.filter((a) => a.featured).length,
    totalArtworks: allArtists.reduce((sum, a) => sum + a.artworkCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Client component for interactive features */}
      <ArtistsPageClient artists={filteredArtists} stats={stats} />

      {/* Filters - Client component for form interaction only */}
      <ArtistsFilters />

      {/* Table - Server-rendered with server actions */}
      <ArtistsTable artists={filteredArtists} />
    </div>
  );
}
