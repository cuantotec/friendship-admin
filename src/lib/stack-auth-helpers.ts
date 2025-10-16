import { stackServerApp } from "@/stack/server";

export async function getUserRole(): Promise<string | null> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return null;
    
    // ONLY use serverMetadata for security (clientMetadata is not secure)
    return user.serverMetadata?.role || 'artist'; // Default to artist if no role set
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

export async function getArtistId(): Promise<number | null> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return null;
    
    // ONLY use serverMetadata for security (clientMetadata is not secure)
    const artistId = user.serverMetadata?.artistID;
    return artistId ? parseInt(artistId.toString()) : null;
  } catch (error) {
    console.error("Error getting artist ID:", error);
    return null;
  }
}

export async function isUserAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin' || role === 'super_admin';
}

export async function isUserArtist(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'artist';
}

export function getRedirectPath(role: string | null): string {
  if (!role) return "/login";
  
  if (role === 'admin' || role === 'super_admin') {
    return "/admin";
  } else {
    return "/artist";
  }
}
