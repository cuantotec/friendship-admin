import { z } from "zod";

// Artist profile validation schema
export const artistProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .transform((val) => {
      // Auto-generate slug from name if needed
      return val;
    }),
  
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  
  bio: z.string()
    .min(10, "Bio must be at least 10 characters")
    .max(2000, "Bio must be less than 2000 characters")
    .trim()
    .optional()
    .or(z.literal('')),
  
  specialty: z.string()
    .min(2, "Specialty must be at least 2 characters")
    .max(100, "Specialty must be less than 100 characters")
    .trim()
    .optional()
    .or(z.literal('')),
  
  exhibitions: z.string()
    .max(5000, "Exhibitions text is too long")
    .optional()
    .or(z.literal('')),
  
  profileImage: z.string()
    .url("Profile image must be a valid URL")
    .optional()
    .or(z.literal('')),
  
  preApproved: z.boolean().optional(),
});

// Artist settings validation schema
export const artistSettingsSchema = z.object({
  featured: z.boolean(),
  isVisible: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

// Types
export type ArtistProfileInput = z.infer<typeof artistProfileSchema>;
export type ArtistSettingsInput = z.infer<typeof artistSettingsSchema>;

