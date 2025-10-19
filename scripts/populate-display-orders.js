const { db } = require('../src/lib/db');
const { artworks } = require('../src/lib/schema');
const { eq, asc } = require('drizzle-orm');

async function populateDisplayOrders() {
  try {
    console.log('=== POPULATING DISPLAY ORDERS ===');
    
    // Get all artworks ordered by creation date
    const allArtworks = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        artistId: artworks.artistId,
        createdAt: artworks.createdAt,
        isVisible: artworks.isVisible
      })
      .from(artworks)
      .orderBy(asc(artworks.createdAt));

    console.log(`Found ${allArtworks.length} artworks total`);

    // Group artworks by artist
    const artworksByArtist = {};
    allArtworks.forEach(artwork => {
      if (!artworksByArtist[artwork.artistId]) {
        artworksByArtist[artwork.artistId] = [];
      }
      artworksByArtist[artwork.artistId].push(artwork);
    });

    console.log(`Found ${Object.keys(artworksByArtist).length} artists`);

    let globalOrder = 1;
    const updates = [];

    // Process each artist's artworks
    for (const [artistId, artistArtworks] of Object.entries(artworksByArtist)) {
      console.log(`\nProcessing artist ${artistId} with ${artistArtworks.length} artworks`);
      
      let artistOrder = 1;
      
      for (const artwork of artistArtworks) {
        // Only assign orders to visible artworks
        if (artwork.isVisible) {
          updates.push({
            id: artwork.id,
            title: artwork.title,
            artistDisplayOrder: artistOrder,
            globalDisplayOrder: globalOrder
          });
          
          console.log(`  ${artwork.title}: artistOrder=${artistOrder}, globalOrder=${globalOrder}`);
          artistOrder++;
          globalOrder++;
        } else {
          console.log(`  ${artwork.title}: SKIPPED (not visible)`);
        }
      }
    }

    console.log(`\n=== UPDATING DATABASE ===`);
    console.log(`Updating ${updates.length} artworks`);

    // Update each artwork
    for (const update of updates) {
      await db
        .update(artworks)
        .set({
          artistDisplayOrder: update.artistDisplayOrder,
          globalDisplayOrder: update.globalDisplayOrder
        })
        .where(eq(artworks.id, update.id));
      
      console.log(`Updated ${update.title}: A${update.artistDisplayOrder}, G${update.globalDisplayOrder}`);
    }

    console.log('\n=== DISPLAY ORDERS POPULATED SUCCESSFULLY ===');
    
    // Verify the updates
    const verification = await db
      .select({
        id: artworks.id,
        title: artworks.title,
        artistDisplayOrder: artworks.artistDisplayOrder,
        globalDisplayOrder: artworks.globalDisplayOrder
      })
      .from(artworks)
      .where(eq(artworks.isVisible, true))
      .orderBy(asc(artworks.globalDisplayOrder));

    console.log('\n=== VERIFICATION ===');
    verification.forEach(artwork => {
      console.log(`${artwork.title}: A${artwork.artistDisplayOrder}, G${artwork.globalDisplayOrder}`);
    });

  } catch (error) {
    console.error('Error populating display orders:', error);
  } finally {
    process.exit(0);
  }
}

populateDisplayOrders();
