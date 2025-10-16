import { getAllArtworks } from "@/lib/actions/admin-actions";
import ArtworksTable from "@/components/admin/artworks-table";
import ArtworksFilters from "@/components/admin/artworks-filters";
import { Card, CardContent } from "@/components/ui/card";

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Artworks Management</h1>
        <p className="text-gray-600 mt-2">
          View, edit, and manage all artworks in the gallery
        </p>
      </div>

      {/* Filters - Client component for form interaction only */}
      <ArtworksFilters locations={locations} />

      {/* Stats - Server-rendered */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Artworks</div>
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
            <div className="text-sm text-gray-600">Hidden</div>
            <div className="text-2xl font-bold text-gray-600">{stats.hidden}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Worth</div>
            <div className="text-2xl font-bold text-green-600">
              ${stats.worth.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table - Server-rendered with server actions */}
      <ArtworksTable artworks={filteredArtworks} />
    </div>
  );
}
