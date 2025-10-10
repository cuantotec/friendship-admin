"use server";

import { db } from "@/lib/simple-db";

export async function updateArtwork(artworkId: number, updates: any) {
  try {
    console.log("=== UPDATE ARTWORK ===");
    console.log("Artwork ID:", artworkId);
    console.log("Updates:", updates);

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'year', 'medium', 'dimensions', 'description', 
      'price', 'status', 'featured'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    console.log("Update fields:", updateFields);
    console.log("Values:", values);

    if (updateFields.length === 0) {
      console.log("No valid fields to update");
      return {
        success: false,
        error: "No valid fields to update"
      };
    }

    const query = `
      UPDATE artworks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(artworkId);

    console.log("Final query:", query);
    console.log("Final values:", values);

    const result = await db.execute(query, values);
    console.log("Query result:", result);

    if (result.rows.length === 0) {
      console.log("No artwork found with ID:", artworkId);
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    console.log("Artwork updated successfully:", result.rows[0]);
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error("Error updating artwork:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update artwork"
    };
  }
}

export async function deleteArtwork(artworkId: number) {
  try {
    console.log("=== DELETE ARTWORK ===");
    console.log("Artwork ID:", artworkId);

    const query = "DELETE FROM artworks WHERE id = $1 RETURNING *";
    const params = [artworkId];
    
    console.log("Delete query:", query);
    console.log("Delete params:", params);

    const result = await db.execute(query, params);
    console.log("Delete result:", result);

    if (result.rows.length === 0) {
      console.log("No artwork found with ID:", artworkId);
      return {
        success: false,
        error: "Artwork not found"
      };
    }

    console.log("Artwork deleted successfully:", result.rows[0]);
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error("Error deleting artwork:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artwork"
    };
  }
}

export async function createArtwork(artworkData: any) {
  try {
    console.log("=== CREATE ARTWORK ===");
    console.log("Artwork data:", artworkData);

    const {
      title,
      year,
      medium,
      dimensions,
      description,
      price,
      status = 'Draft',
      featured = false,
      artistId
    } = artworkData;

    const query = `
      INSERT INTO artworks (
        title, slug, year, medium, dimensions, description, 
        price, status, featured, artist_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const params = [
      title,
      slug,
      year,
      medium,
      dimensions,
      description,
      price,
      status,
      featured,
      artistId
    ];

    console.log("Create query:", query);
    console.log("Create params:", params);

    const result = await db.execute(query, params);
    console.log("Create result:", result);

    console.log("Artwork created successfully:", result.rows[0]);
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error("Error creating artwork:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create artwork"
    };
  }
}
