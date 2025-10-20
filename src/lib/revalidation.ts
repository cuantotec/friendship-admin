/**
 * Revalidation helper for triggering ISR cache invalidation on the main site
 * This calls the revalidation API at friendshipcentergallery.org
 */

interface RevalidationOptions {
  paths?: string[];
  tags?: string[];
}

interface RevalidationResponse {
  message: string;
  revalidated: boolean;
  now: number;
  paths: string[];
  tags: string[];
}

/**
 * Triggers revalidation on the main site
 * @param options - Object containing paths and/or tags to revalidate
 * @returns Promise with revalidation response
 */
export async function triggerRevalidation(options: RevalidationOptions): Promise<RevalidationResponse> {
  const mainSiteUrl = process.env.MAIN_SITE_URL || 'https://friendshipcentergallery.org';
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  
  if (!revalidateSecret) {
    throw new Error('REVALIDATE_SECRET environment variable is not set');
  }

  const revalidateUrl = `${mainSiteUrl}/api/revalidate`;
  
  try {
    const response = await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: revalidateSecret,
        paths: options.paths || [],
        tags: options.tags || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Revalidation failed: ${errorData.message}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    throw error;
  }
}

/**
 * Common revalidation patterns for the gallery
 */
export const revalidationPatterns = {
  // Revalidate all artwork-related pages
  artwork: () => triggerRevalidation({
    paths: ['/', '/artwork', '/artists'],
    tags: ['artwork', 'artists']
  }),
  
  // Revalidate artist pages
  artists: () => triggerRevalidation({
    paths: ['/artists', '/'],
    tags: ['artists']
  }),
  
  // Revalidate specific artwork
  artworkById: (id: string) => triggerRevalidation({
    paths: [`/artwork/${id}`, '/', '/artwork'],
    tags: ['artwork']
  }),
  
  // Revalidate specific artist
  artistById: (id: string) => triggerRevalidation({
    paths: [`/artists/${id}`, '/artists', '/'],
    tags: ['artists']
  }),
  
  // Revalidate events pages
  events: () => triggerRevalidation({
    paths: ['/events', '/'],
    tags: ['events']
  }),
  
  // Revalidate everything
  all: () => triggerRevalidation({
    paths: ['/'],
    tags: ['artwork', 'artists', 'events']
  })
};
