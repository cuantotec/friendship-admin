/**
 * Authorization Helpers
 * 
 * These functions enforce authorization rules across the application:
 * - Users can only access/modify their own data
 * - Admins can access/modify any data
 */

import { stackServerApp } from "@/stack/server";

/**
 * Get the current user's role and artist ID
 */
export async function getCurrentUserAuth(): Promise<{
  userId: string | null;
  role: string | null;
  artistId: number | null;
  isAdmin: boolean;
}> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return {
        userId: null,
        role: null,
        artistId: null,
        isAdmin: false
      };
    }

    // ONLY use serverMetadata for security (clientMetadata is not secure)
    const role = user.serverMetadata?.role || 'artist';
    const artistIdStr = user.serverMetadata?.artistID;
    const artistId = artistIdStr ? parseInt(artistIdStr.toString()) : null;
    const isAdmin = role === 'admin' || role === 'super_admin';

    return {
      userId: user.id,
      role,
      artistId,
      isAdmin
    };
  } catch (error) {
    console.error("Error getting user auth:", error);
    return {
      userId: null,
      role: null,
      artistId: null,
      isAdmin: false
    };
  }
}

/**
 * Check if user can access/modify an artwork
 * Returns true if:
 * - User is an admin
 * - User is the artist who owns the artwork
 */
export async function canAccessArtwork(artworkArtistId: number): Promise<boolean> {
  const { isAdmin, artistId } = await getCurrentUserAuth();
  
  // Admins can access any artwork
  if (isAdmin) return true;
  
  // Artists can only access their own artworks
  return artistId === artworkArtistId;
}

/**
 * Check if user can access/modify an artist profile
 * Returns true if:
 * - User is an admin
 * - User is the artist themselves
 */
export async function canAccessArtist(targetArtistId: number): Promise<boolean> {
  const { isAdmin, artistId } = await getCurrentUserAuth();
  
  // Admins can access any artist
  if (isAdmin) return true;
  
  // Artists can only access their own profile
  return artistId === targetArtistId;
}

/**
 * Require authorization for artwork access
 * Throws error if unauthorized
 */
export async function requireArtworkAccess(artworkArtistId: number): Promise<void> {
  const canAccess = await canAccessArtwork(artworkArtistId);
  
  if (!canAccess) {
    throw new Error("Unauthorized: You can only access your own artworks");
  }
}

/**
 * Require authorization for artist profile access
 * Throws error if unauthorized
 */
export async function requireArtistAccess(targetArtistId: number): Promise<void> {
  const canAccess = await canAccessArtist(targetArtistId);
  
  if (!canAccess) {
    throw new Error("Unauthorized: You can only access your own profile");
  }
}

/**
 * Require admin access
 * Throws error if not admin
 */
export async function requireAdminAccess(): Promise<void> {
  const { isAdmin } = await getCurrentUserAuth();
  
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
}


