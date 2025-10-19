/**
 * Shared Type Definitions
 * 
 * This file contains all shared types used across the application.
 * These types ensure consistency between frontend and backend.
 */

import { Artist as DbArtist, Artwork as DbArtwork, Event as DbEvent } from "@/lib/schema";

// ============================================================================
// Database Types (from Drizzle schema)
// ============================================================================

export type Artist = DbArtist;

// Override price to be number instead of string from decimal
export type Artwork = Omit<DbArtwork, 'price'> & {
  price: string; // Drizzle decimal returns string
};

export type Event = DbEvent;

// ============================================================================
// Extended Types for Client Components
// ============================================================================

/**
 * Artist with additional computed fields for client use
 */
export interface ArtistWithMeta extends Artist {
  artworkCount?: number;
}

/**
 * Artwork with artist information
 */
export interface ArtworkWithArtist extends Artwork {
  artistName?: string | null;
  artist?: Artist | null;
}

/**
 * Artwork with display order information (for artist dashboard)
 */
export interface ArtworkWithDisplayOrder extends Artwork {
  globalLocationId?: number;
  artistLocationId?: number;
}

/**
 * Event with additional computed fields
 */
export interface EventWithMeta extends Event {
  attendeeCount?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Form Data Types
// ============================================================================

export interface ArtistProfileFormData {
  name: string;
  bio?: string;
  specialty?: string;
  exhibitions?: string;
  profileImage?: string;
}

export interface ArtistSettingsFormData {
  featured: boolean;
  isVisible?: boolean;
  isHidden?: boolean;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  numberOfAttendees: number;
  additionalInformation?: string | null;
  registrationData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ArtworkFormData {
  title: string;
  slug?: string;
  artistId: number;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  price: number;
  status?: string;
  location?: string;
  widthCm?: string | number | null;
  heightCm?: string | number | null;
  depthCm?: string | number | null;
  isSculpture?: boolean;
  isFramed?: boolean;
  isVisible?: boolean;
}

export interface ArtworkUpdateOrderData {
  id: number;
  artistLocationId?: number;
  globalLocationId?: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ArtistDashboardProps {
  artist: Artist | null;
  artworks: ArtworkWithDisplayOrder[];
}

export interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onArtworkUpdated: (artwork: Artwork) => void;
  onArtworkDeleted: (artworkId: number) => void;
  artistId: number;
  mode: 'create' | 'edit';
}

export interface ArtistProfileModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export interface ArtistSettingsModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

// ============================================================================
// Admin Dashboard Types
// ============================================================================

export interface AdminStats {
  totalArtworks: number;
  artworksWorth: string;
  totalArtists: number;
  activeEvents: number;
}

export interface ArtworkListItem {
  id: number;
  title: string;
  slug: string | null;
  artistId: number;
  artistName: string | null;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  price: string; // Decimal from DB is string
  status: string;
  location: string;
  watermarkedImage: string | null;
  originalImage: string | null;
  isVisible: boolean;
  featured: number | null;
  widthCm: string | null; // Decimal from DB is string
  heightCm: string | null; // Decimal from DB is string
  depthCm: string | null; // Decimal from DB is string
  approvalStatus: string; // pending, approved, rejected
  createdAt: string;
}

export interface ArtistListItem {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  bio: string | null;
  profileImage: string | null;
  specialty: string | null;
  isVisible: boolean;
  isHidden: boolean | null;
  featured: boolean;
  preApproved: boolean;
  createdAt: string;
  artworkCount: number;
  // Stack Auth user data
  hasUser: boolean;
  userId: string | null;
  userEmail: string | null;
  userPrimaryEmail: string | null;
}

export interface EventListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  address: string | null;
  externalUrl: string | null;
  registrationUrl: string | null;
  registrationType: string;
  featuredImage: string | null;
  status: string | null;
  isCanceled: boolean;
  registrationEnabled: boolean;
  paymentEnabled: boolean;
  isRecurring: boolean;
  isFreeEvent: boolean;
  chabadPay: boolean;
  recurringType: string | null;
  recurringStartTime: string | null;
  recurringStartAmpm: string | null;
  recurringEndTime: string | null;
  recurringEndAmpm: string | null;
  featuredArtists: unknown;
  parentEventId: number | null;
  isRecurringInstance: boolean;
  paymentTiers: unknown;
  createdAt: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific fields required in a type
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make specific fields optional in a type
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

/**
 * Extract non-null type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

