import { pgTable, serial, text, json, boolean, timestamp, unique, foreignKey, integer, numeric, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const contacts = pgTable("contacts", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	subject: text().notNull(),
	message: text().notNull(),
	formData: json("form_data"),
	source: text(),
	isArchived: boolean("is_archived").default(false),
	optInEmails: boolean("opt_in_emails").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});


export const artworks = pgTable("artworks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	artistId: integer("artist_id").notNull(),
	year: text().notNull(),
	medium: text().notNull(),
	dimensions: text().notNull(),
	description: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	status: text().default('Available').notNull(),
	featured: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	widthCm: numeric("width_cm", { precision: 8, scale:  2 }),
	heightCm: numeric("height_cm", { precision: 8, scale:  2 }),
	depthCm: numeric("depth_cm", { precision: 8, scale:  2 }),
	model3DUrl: text("model_3d_url"),
	has3DModel: boolean("has_3d_model").default(false).notNull(),
	slug: text().notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	privateImages: jsonb("private_images").default([]),
	show3D: boolean("show_3d").default(false).notNull(),
	artistDisplayOrder: integer("artist_display_order").default(0),
	globalDisplayOrder: integer("global_display_order").default(0),
	originalImage: text("original_image"),
	studioVisualizationUrl: text("studio_visualization_url"),
	hasStudioVisualization: boolean("has_studio_visualization").default(false).notNull(),
	isSculpture: boolean("is_sculpture").default(false).notNull(),
	watermarkedImage: text("watermarked_image"),
	watermarkedImagesHistory: jsonb("watermarked_images_history").default([]),
	isFramed: boolean("is_framed").default(false).notNull(),
	location: text().default('Gallery').notNull(),
	approvalStatus: text("approval_status").default('pending').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.artistId],
			foreignColumns: [artists.id],
			name: "artworks_artist_id_artists_id_fk"
		}),
	unique("artworks_slug_unique").on(table.slug),
]);

export const artistInvitations = pgTable("artist_invitations", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	specialty: text(),
	message: text(),
	code: text().notNull(),
	invitedBy: text("invited_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }).default(sql`(now() + '7 days'::interval)`),
	stackUserId: text("stack_user_id"),
}, (table) => [
	unique("artist_invitations_code_unique").on(table.code),
]);

export const artists = pgTable("artists", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	bio: text(),
	profileImage: text("profile_image"),
	specialty: text(),
	exhibitions: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	slug: text().notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	featured: boolean().default(false).notNull(),
}, (table) => [
	unique("artists_slug_unique").on(table.slug),
]);

export const inquiries = pgTable("inquiries", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	message: text().notNull(),
	artworkId: integer("artwork_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.artworkId],
			foreignColumns: [artworks.id],
			name: "inquiries_artwork_id_artworks_id_fk"
		}),
]);

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	location: text(),
	description: text().notNull(),
	eventType: text("event_type").default('Exhibition').notNull(),
	featuredImage: text("featured_image"),
	featuredArtists: json("featured_artists"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	address: text(),
	formTemplateId: integer("form_template_id"),
	registrationEnabled: boolean("registration_enabled").default(false).notNull(),
	slug: text().notNull(),
	externalUrl: text("external_url"),
	registrationUrl: text("registration_url"),
	registrationType: text("registration_type").default('modal').notNull(),
	paymentEnabled: boolean("payment_enabled").default(false).notNull(),
	isCanceled: boolean("is_canceled").default(false).notNull(),
	status: text().default('Upcoming'),
	isRecurring: boolean("is_recurring").default(false).notNull(),
	recurringType: text("recurring_type"),
	recurringDays: json("recurring_days"),
	parentEventId: integer("parent_event_id"),
	isRecurringInstance: boolean("is_recurring_instance").default(false).notNull(),
	recurringStartTime: text("recurring_start_time"),
	recurringStartAmpm: text("recurring_start_ampm"),
	recurringEndTime: text("recurring_end_time"),
	recurringEndAmpm: text("recurring_end_ampm"),
	paymentTiers: json("payment_tiers"),
	isFreeEvent: boolean("is_free_event").default(false).notNull(),
	chabadPay: boolean("chabad_pay").default(false).notNull(),
}, (table) => [
	unique("events_title_unique").on(table.title),
	unique("events_slug_unique").on(table.slug),
]);

export const eventRegistrations = pgTable("event_registrations", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	fullName: text("full_name").notNull(),
	email: text().notNull(),
	phoneNumber: text("phone_number"),
	numberOfAttendees: integer("number_of_attendees").default(1).notNull(),
	additionalInformation: text("additional_information"),
	registrationData: jsonb("registration_data").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_registrations_event_id_events_id_fk"
		}).onDelete("cascade"),
]);
