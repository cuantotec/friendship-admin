import { getAllArtists } from "@/lib/actions/admin-actions";
import ArtistsTable from "@/components/admin/artists-table";
import ArtistsFilters from "@/components/admin/artists-filters";
import { Card, CardContent } from "@/components/ui/card";

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Artists Management</h1>
        <p className="text-gray-600 mt-2">
          View, edit, and manage all artists in the gallery
        </p>
      </div>

      {/* Filters - Client component for form interaction only */}
      <ArtistsFilters />

      {/* Stats - Server-rendered */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Artists</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Visible</div>
            <div className="text-2xl font-bold text-green-600">{stats.visible}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Featured</div>
            <div className="text-2xl font-bold text-blue-600">{stats.featured}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Artworks</div>
            <div className="text-2xl font-bold">{stats.totalArtworks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table - Server-rendered with server actions */}
      <ArtistsTable artists={filteredArtists} />
    </div>
  );
}
