import { pgTable, index, foreignKey, unique, serial, text, integer, numeric, timestamp, boolean, jsonb, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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
	privateImages: jsonb("private_images"),
	show3D: boolean("show_3d").default(false).notNull(),
	artistDisplayOrder: integer("artist_display_order").default(0),
	globalDisplayOrder: integer("global_display_order").default(0),
	originalImage: text("original_image"),
	studioVisualizationUrl: text("studio_visualization_url"),
	hasStudioVisualization: boolean("has_studio_visualization").default(false),
	isSculpture: boolean("is_sculpture").default(false).notNull(),
	watermarkedImage: text("watermarked_image"),
	watermarkedImagesHistory: jsonb("watermarked_images_history").default([]),
	isFramed: boolean("is_framed").default(false).notNull(),
	location: text().default('Gallery').notNull(),
}, (table) => [
	index("idx_artworks_featured_performance").using("btree", table.featured.desc().nullsFirst().op("int4_ops"), table.isVisible.asc().nullsLast().op("int4_ops"), table.status.asc().nullsLast().op("int4_ops"), table.createdAt.desc().nullsFirst().op("int4_ops")).where(sql`((featured > 0) AND (is_visible = true) AND (watermarked_image IS NOT NULL))`),
	foreignKey({
			columns: [table.artistId],
			foreignColumns: [artists.id],
			name: "artworks_artist_id_artists_id_fk"
		}),
	unique("artworks_slug_unique").on(table.slug),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	transactionId: text("transaction_id").notNull(),
	eventId: integer("event_id").notNull(),
	submissionId: integer("submission_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('USD').notNull(),
	status: text().notNull(),
	paymentMethod: text("payment_method").notNull(),
	customerName: text("customer_name").notNull(),
	customerEmail: text("customer_email").notNull(),
	authCode: text("auth_code"),
	responseCode: text("response_code"),
	responseText: text("response_text"),
	avsResultCode: text("avs_result_code"),
	cvvResultCode: text("cvv_result_code"),
	errorMessage: text("error_message"),
	paymentData: jsonb("payment_data"),
	processedAt: timestamp("processed_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	invoiceNumber: text("invoice_number"),
	selectedTierId: text("selected_tier_id"),
	tierName: text("tier_name"),
	quantity: integer().default(1),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "payments_event_id_fkey"
		}),
	foreignKey({
			columns: [table.submissionId],
			foreignColumns: [formSubmissions.id],
			name: "payments_submission_id_fkey"
		}),
	unique("payments_transaction_id_key").on(table.transactionId),
]);

export const artists = pgTable("artists", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	bio: text(),
	profileImage: text("profile_image"),
	specialty: text(),
	exhibitions: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	email: text(),
	password: text(),
	isActive: boolean("is_active").default(true).notNull(),
	portalAccess: boolean("portal_access").default(false).notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
	onboardingCompletedAt: timestamp("onboarding_completed_at", { mode: 'string' }),
	onboardingSkippedAt: timestamp("onboarding_skipped_at", { mode: 'string' }),
	preApproved: boolean("pre_approved").default(false).notNull(),
	isHidden: boolean("is_hidden").default(false),
	slug: text(),
	isVisible: boolean("is_visible").default(true).notNull(),
	featured: boolean().default(false).notNull(),
}, (table) => [
	unique("artists_email_key").on(table.email),
]);

export const formSubmissions = pgTable("form_submissions", {
	id: serial().primaryKey().notNull(),
	templateId: integer("template_id").notNull(),
	formData: text("form_data").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	eventId: integer("event_id"),
	submitterName: text("submitter_name"),
	submitterEmail: text("submitter_email"),
	status: text().default('new').notNull(),
	confirmationCode: text("confirmation_code"),
	isArchived: boolean("is_archived").default(false),
	paymentId: text("payment_id"),
	paymentInfo: jsonb("payment_info"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	archived: boolean().default(false),
	selectedTier: jsonb("selected_tier"),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "form_submissions_event_id_events_id_fk"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [formTemplates.id],
			name: "form_submissions_template_id_form_templates_id_fk"
		}),
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
	eventType: text("event_type").notNull(),
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
	isCancelled: boolean().default(false),
	isRecurring: boolean("is_recurring").default(false).notNull(),
	recurringType: text("recurring_type"),
	recurringDays: json("recurring_days"),
	parentEventId: integer("parent_event_id"),
	isRecurringInstance: boolean("is_recurring_instance").default(false).notNull(),
	recurringStartTime: text("recurring_start_time"),
	recurringStartAmpm: text("recurring_start_ampm"),
	recurringEndTime: text("recurring_end_time"),
	recurringEndAmpm: text("recurring_end_ampm"),
	paymentTiers: jsonb("payment_tiers").default([]),
	isFreeEvent: boolean("is_free_event").default(false).notNull(),
	chabadPay: boolean("chabad_pay").default(true),
}, (table) => [
	foreignKey({
			columns: [table.formTemplateId],
			foreignColumns: [formTemplates.id],
			name: "events_form_template_id_form_templates_id_fk"
		}),
	foreignKey({
			columns: [table.parentEventId],
			foreignColumns: [table.id],
			name: "events_parent_event_id_fkey"
		}),
	unique("events_title_unique").on(table.title),
	unique("events_slug_unique").on(table.slug),
]);

export const formTemplates = pgTable("form_templates", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
});

export const subscribers = pgTable("subscribers", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	isActive: boolean("is_active").default(true).notNull(),
	source: text().default('event_registration').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	phone: text(),
	metadata: jsonb(),
	unsubscribeToken: text("unsubscribe_token").notNull(),
	address: text(),
}, (table) => [
	unique("subscribers_email_key").on(table.email),
	unique("subscribers_unsubscribe_token_key").on(table.unsubscribeToken),
]);

export const watermarkConfig = pgTable("watermark_config", {
	id: serial().primaryKey().notNull(),
	enabled: boolean().default(true).notNull(),
	imageUrl: text("image_url").default(''),
	position: text().default('bottom_right'),
	opacity: integer().default(70),
	size: integer().default(50),
	offsetX: integer("offset_x").default(20),
	offsetY: integer("offset_y").default(20),
	quality: text().default('auto'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	textWatermarkEnabled: boolean("text_watermark_enabled").default(false),
	textWatermarkContent: text("text_watermark_content").default('Test'),
	textWatermarkFontSize: integer("text_watermark_font_size").default(24),
	textWatermarkOpacity: integer("text_watermark_opacity").default(80),
	textWatermarkFontFamily: text("text_watermark_font_family").default('Arial'),
	textWatermarkColor: text("text_watermark_color").default('#FFFFFF'),
	textWatermarkBold: boolean("text_watermark_bold").default(true),
});
