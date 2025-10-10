import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  decimal,
  json,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Artists Table - Gallery content only (no authentication)
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  specialty: text("specialty"),
  exhibitions: json("exhibitions").$type<string[]>(),
  // Visibility control
  isHidden: boolean("is_hidden").default(false).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Artworks Table (reusing from original schema)
export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  artistId: integer("artist_id")
    .references(() => artists.id)
    .notNull(),
  year: text("year").notNull(),
  medium: text("medium").notNull(),
  dimensions: text("dimensions").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("Available"),

  originalImage: text("original_image").$type<string>(),
  watermarkedImage: text("watermarked_image").$type<string>(),
  watermarkedImagesHistory: jsonb("watermarked_images_history")
    .$type<
      Array<{
        url: string;
        generatedAt: string;
        settings: {
          opacity?: number;
          size?: number;
          position?: string;
          textContent?: string;
          textOpacity?: number;
          fontSize?: number;
          fontFamily?: string;
          color?: string;
        };
        notes?: string;
      }>
    >()
    .default([]),
  privateImages: jsonb("private_images").$type<string[]>().default([]),
  featured: integer("featured").default(0),
  // AR-specific dimensions in centimeters
  widthCm: decimal("width_cm", { precision: 8, scale: 2 }),
  heightCm: decimal("height_cm", { precision: 8, scale: 2 }),
  depthCm: decimal("depth_cm", { precision: 8, scale: 2 }),
  // 3D Model for AR
  model3dUrl: text("model_3d_url"),
  has3dModel: boolean("has_3d_model").default(false).notNull(),
  studioVisualizationUrl: text("studio_visualization_url"),
  hasStudioVisualization: boolean("has_studio_visualization")
    .default(false)
    .notNull(),
  show3D: boolean("show_3d").default(false).notNull(),
  // Sculpture designation
  isSculpture: boolean("is_sculpture").default(false).notNull(),
  // Framed status
  isFramed: boolean("is_framed").default(false).notNull(),
  // Location field
  location: text("location").default("Gallery").notNull(),
  // Visibility control
  isVisible: boolean("is_visible").default(true).notNull(),
  // Display ordering for drag-and-drop functionality
  artistDisplayOrder: integer("artist_display_order").default(0),
  globalDisplayOrder: integer("global_display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events Table (reusing from original schema)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull().default("Exhibition"),
  slug: text("slug").notNull().unique(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  address: text("address"),
  externalUrl: text("external_url"),
  registrationUrl: text("registration_url"),
  registrationType: text("registration_type").notNull().default("modal"), // 'modal', 'external', 'disabled'
  status: text("status").default("Upcoming"), // Keep for backward compatibility, will be auto-computed
  featuredImage: text("featured_image"),
  featuredArtists: json("featured_artists").$type<string[]>(),
  formTemplateId: integer("form_template_id"),
  registrationEnabled: boolean("registration_enabled").default(false).notNull(),
  // Cancellation status
  is_canceled: boolean("is_canceled").default(false).notNull(),
  // Payment fields
  paymentEnabled: boolean("payment_enabled").default(false).notNull(),
  // Chabad Pay - simplified boolean control
  chabad_pay: boolean("chabad_pay").default(false).notNull(),
  // Payment tiers support
  paymentTiers: json("payment_tiers").$type<
    Array<{
      id: string;
      name: string;
      description?: string;
      amount: number;
      maxQuantity?: number;
      isActive: boolean;
      displayOrder: number;
    }>
  >(),

  // Recurring event fields
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringType: text("recurring_type"), // 'weekly', 'biweekly', 'monthly', 'bimonthly'
  recurringDays: json("recurring_days").$type<number[]>(), // Array of day numbers (0=Sunday, 1=Monday, etc.)
  recurringStartTime: text("recurring_start_time"), // Time in HH:MM format
  recurringStartAmPm: text("recurring_start_ampm"), // AM/PM
  recurringEndTime: text("recurring_end_time"), // Time in HH:MM format
  recurringEndAmPm: text("recurring_end_ampm"), // AM/PM
  parentEventId: integer("parent_event_id"), // For linking recurring instances
  isRecurringInstance: boolean("is_recurring_instance")
    .default(false)
    .notNull(),
  isFreeEvent: boolean("is_free_event").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event Artists Junction Table (Many-to-Many)
export const eventArtists = pgTable("event_artists", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .references(() => events.id)
    .notNull(),
  artistId: integer("artist_id")
    .references(() => artists.id)
    .notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inquiries Table
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  artworkId: integer("artwork_id")
    .references(() => artworks.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact Submissions Table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  formData: json("form_data"),
  source: text("source"),
  isArchived: boolean("is_archived").default(false),
  optInEmails: boolean("opt_in_emails").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter Subscriptions Table
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gallery Hours Table
export const galleryHours = pgTable("gallery_hours", {
  id: serial("id").primaryKey(),
  mondayOpen: text("monday_open"),
  mondayClose: text("monday_close"),
  mondayUseText: boolean("monday_use_text").default(false).notNull(),
  mondayText: text("monday_text"),
  tuesdayOpen: text("tuesday_open"),
  tuesdayClose: text("tuesday_close"),
  tuesdayUseText: boolean("tuesday_use_text").default(false).notNull(),
  tuesdayText: text("tuesday_text"),
  wednesdayOpen: text("wednesday_open"),
  wednesdayClose: text("wednesday_close"),
  wednesdayUseText: boolean("wednesday_use_text").default(false).notNull(),
  wednesdayText: text("wednesday_text"),
  thursdayOpen: text("thursday_open"),
  thursdayClose: text("thursday_close"),
  thursdayUseText: boolean("thursday_use_text").default(false).notNull(),
  thursdayText: text("thursday_text"),
  fridayOpen: text("friday_open"),
  fridayClose: text("friday_close"),
  fridayUseText: boolean("friday_use_text").default(false).notNull(),
  fridayText: text("friday_text"),
  saturdayOpen: text("saturday_open"),
  saturdayClose: text("saturday_close"),
  saturdayUseText: boolean("saturday_use_text").default(false).notNull(),
  saturdayText: text("saturday_text"),
  sundayOpen: text("sunday_open"),
  sundayClose: text("sunday_close"),
  sundayUseText: boolean("sunday_use_text").default(false).notNull(),
  sundayText: text("sunday_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const artistsRelations = relations(artists, ({ many }) => ({
  artworks: many(artworks),
  eventArtists: many(eventArtists),
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  artist: one(artists, {
    fields: [artworks.artistId],
    references: [artists.id],
  }),
  inquiries: many(inquiries),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  artwork: one(artworks, {
    fields: [inquiries.artworkId],
    references: [artworks.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  eventArtists: many(eventArtists),
}));

export const eventArtistsRelations = relations(eventArtists, ({ one }) => ({
  event: one(events, {
    fields: [eventArtists.eventId],
    references: [events.id],
  }),
  artist: one(artists, {
    fields: [eventArtists.artistId],
    references: [artists.id],
  }),
}));

// Create Zod schemas for validation
export const artistInsertSchema = createInsertSchema(artists, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  bio: (schema) => schema.min(10, "Bio must be at least 10 characters"),
  profileImage: (schema) => schema.url("Profile image must be a valid URL"),
  email: (schema) =>
    schema
      .email("Must be a valid email address")
      .transform((val) => val?.toLowerCase()),
});


export const artworkInsertSchema = createInsertSchema(artworks, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  description: (schema) =>
    schema.min(10, "Description must be at least 10 characters"),
  location: (schema) => schema.default("Gallery"),
  widthCm: (schema) =>
    schema.nullish().transform((value) => {
      if (value === null || value === undefined || value === "") return null;
      return typeof value === "string" ? parseInt(value) : value;
    }),
  heightCm: (schema) =>
    schema.nullish().transform((value) => {
      if (value === null || value === undefined || value === "") return null;
      return typeof value === "string" ? parseInt(value) : value;
    }),
  isFramed: (schema) => schema.optional(),
});

export const eventInsertSchema = createInsertSchema(events, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  description: (schema) =>
    schema.min(10, "Description must be at least 10 characters"),
  startDate: (schema) => schema.transform((value: string | Date) => new Date(value)),
  endDate: (schema) =>
    schema
      .nullish()
      .transform((value: string | Date | null) => (value ? new Date(value) : null)),
  formTemplateId: (schema) => schema.nullish(),
  registrationEnabled: (schema) => schema.optional(),
  slug: (schema) => schema.optional(),
  isRecurring: (schema) => schema.optional(),
  recurringType: (schema) => schema.optional(),
  recurringDays: (schema) => schema.optional(),
  parentEventId: (schema) => schema.optional(),
  isRecurringInstance: (schema) => schema.optional(),
});

export const inquiryInsertSchema = createInsertSchema(inquiries, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) =>
    schema
      .email("Must be a valid email address")
      .transform((val) => val.toLowerCase()),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
});

export const contactInsertSchema = createInsertSchema(contacts, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) =>
    schema
      .email("Must provide a valid email address")
      .transform((val) => val.toLowerCase()),
  subject: (schema) => schema.min(2, "Subject is required"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
});

export const newsletterInsertSchema = createInsertSchema(newsletters, {
  email: (schema) =>
    schema
      .email("Must be a valid email address")
      .transform((val) => val.toLowerCase()),
});

export const galleryHoursInsertSchema = createInsertSchema(galleryHours);

export const eventArtistsInsertSchema = createInsertSchema(eventArtists);

// Export types
export type Artist = typeof artists.$inferSelect;
export type ArtistInsert = z.infer<typeof artistInsertSchema>;


export type Artwork = typeof artworks.$inferSelect;
export type ArtworkInsert = z.infer<typeof artworkInsertSchema>;

export type Event = typeof events.$inferSelect & {
  is_canceled?: boolean;
};
export type EventInsert = z.infer<typeof eventInsertSchema>;

export type Inquiry = typeof inquiries.$inferSelect;
export type InquiryInsert = z.infer<typeof inquiryInsertSchema>;

export type Contact = typeof contacts.$inferSelect;
export type ContactInsert = z.infer<typeof contactInsertSchema>;

export type Newsletter = typeof newsletters.$inferSelect;
export type NewsletterInsert = z.infer<typeof newsletterInsertSchema>;

export type GalleryHours = typeof galleryHours.$inferSelect;
export type GalleryHoursInsert = z.infer<typeof galleryHoursInsertSchema>;

export type EventArtist = typeof eventArtists.$inferSelect;
export type EventArtistInsert = z.infer<typeof eventArtistsInsertSchema>;
