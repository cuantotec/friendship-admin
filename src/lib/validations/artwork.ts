import { z } from "zod";

// Constants
export const MAX_PRICE = 100000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;

// Artwork validation schema
export const artworkSchema = z.object({
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`)
    .trim(),
  
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(MAX_TITLE_LENGTH, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  
  artistId: z.number()
    .int("Artist ID must be an integer")
    .positive("Artist ID must be positive"),
  
  year: z.string()
    .min(4, "Year must be 4 digits")
    .max(4, "Year must be 4 digits")
    .regex(/^\d{4}$/, "Year must be a valid 4-digit year"),
  
  medium: z.string()
    .min(2, "Medium must be at least 2 characters")
    .max(100, "Medium must be less than 100 characters")
    .trim(),
  
  dimensions: z.string()
    .min(2, "Dimensions must be at least 2 characters")
    .max(100, "Dimensions must be less than 100 characters")
    .trim(),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .trim(),
  
  price: z.union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return 0;
      return num;
    })
    .pipe(
      z.number()
        .nonnegative("Price must be 0 or greater")
        .max(MAX_PRICE, `Price cannot exceed $${MAX_PRICE.toLocaleString()}`)
    ),
  
  status: z.enum(['Available', 'Sold', 'Reserved', 'Draft', 'Not for Sale']).default('Draft'),
  
  featured: z.union([z.boolean(), z.number()])
    .transform((val) => typeof val === 'boolean' ? (val ? 1 : 0) : val)
    .pipe(z.number().int().min(0).max(1))
    .optional(),
  
  originalImage: z.string().url("Invalid image URL").nullish(),
  watermarkedImage: z.string().url("Invalid image URL").nullish(),
  
  location: z.string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters")
    .default('Gallery'),
  
  widthCm: z.union([z.string(), z.number()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .pipe(z.number().positive("Width must be positive").max(1000, "Width too large").nullable())
    .optional(),
  
  heightCm: z.union([z.string(), z.number()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .pipe(z.number().positive("Height must be positive").max(1000, "Height too large").nullable())
    .optional(),
  
  depthCm: z.union([z.string(), z.number()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .pipe(z.number().positive("Depth must be positive").max(1000, "Depth too large").nullable())
    .optional(),
  
  isSculpture: z.boolean().default(false),
  isFramed: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

// Create artwork schema (required fields only)
export const createArtworkSchema = artworkSchema.pick({
  title: true,
  artistId: true,
  year: true,
  medium: true,
  dimensions: true,
  description: true,
  price: true,
  status: true,
  location: true,
}).extend({
  featured: artworkSchema.shape.featured,
  originalImage: artworkSchema.shape.originalImage,
  watermarkedImage: artworkSchema.shape.watermarkedImage,
  widthCm: artworkSchema.shape.widthCm,
  heightCm: artworkSchema.shape.heightCm,
  depthCm: artworkSchema.shape.depthCm,
  isSculpture: artworkSchema.shape.isSculpture,
  isFramed: artworkSchema.shape.isFramed,
});

// Update artwork schema (all fields optional except id)
export const updateArtworkSchema = artworkSchema.partial().extend({
  id: z.number().int().positive("Invalid artwork ID"),
});

// Types
export type ArtworkInput = z.infer<typeof artworkSchema>;
export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;

