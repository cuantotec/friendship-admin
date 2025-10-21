import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { getArtistById } from "@/lib/actions/get-artist";
import ArtistDashboard from "@/components/artist-dashboard";

export const dynamic = "force-dynamic";

export default async function ArtistPage() {
  // Verify user is logged in
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get artist data
  const result = await getArtistById(undefined, user);
  
  if (!result.success) {
    // If artist profile doesn't exist, redirect to login with error
    redirect(`/login?error=${encodeURIComponent(result.error || "Artist profile not found")}`);
  }

  const { artist, artworks } = result.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <ArtistDashboard artist={artist} artworks={artworks} />
    </div>
  );
}
