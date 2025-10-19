import { getAllArtworksForSorting } from "@/lib/actions/global-sorting-actions";
import GlobalSortingClient from "@/components/admin/global-sorting-client";

export const dynamic = "force-dynamic";

export default async function GlobalSortingPage() {
  const artworks = await getAllArtworksForSorting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Global Artwork Sorting</h1>
        <p className="text-gray-600 mt-1">
          Drag and drop to reorder artworks globally. This affects the display order across the entire gallery.
        </p>
      </div>

      <GlobalSortingClient artworks={artworks} />
    </div>
  );
}
