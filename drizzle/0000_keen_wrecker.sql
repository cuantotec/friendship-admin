CREATE TABLE "artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"bio" text,
	"profile_image" text,
	"specialty" text,
	"exhibitions" json,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"artist_id" integer NOT NULL,
	"year" text NOT NULL,
	"medium" text NOT NULL,
	"dimensions" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'Available' NOT NULL,
	"original_image" text,
	"watermarked_image" text,
	"watermarked_images_history" jsonb DEFAULT '[]'::jsonb,
	"private_images" jsonb DEFAULT '[]'::jsonb,
	"featured" integer DEFAULT 0,
	"width_cm" numeric(8, 2),
	"height_cm" numeric(8, 2),
	"depth_cm" numeric(8, 2),
	"model_3d_url" text,
	"has_3d_model" boolean DEFAULT false NOT NULL,
	"studio_visualization_url" text,
	"has_studio_visualization" boolean DEFAULT false NOT NULL,
	"show_3d" boolean DEFAULT false NOT NULL,
	"is_sculpture" boolean DEFAULT false NOT NULL,
	"is_framed" boolean DEFAULT false NOT NULL,
	"location" text DEFAULT 'Gallery' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"artist_display_order" integer DEFAULT 0,
	"global_display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artworks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"form_data" json,
	"source" text,
	"is_archived" boolean DEFAULT false,
	"opt_in_emails" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_type" text DEFAULT 'Exhibition' NOT NULL,
	"slug" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"location" text,
	"address" text,
	"external_url" text,
	"registration_url" text,
	"registration_type" text DEFAULT 'modal' NOT NULL,
	"status" text DEFAULT 'Upcoming',
	"featured_image" text,
	"featured_artists" json,
	"form_template_id" integer,
	"registration_enabled" boolean DEFAULT false NOT NULL,
	"is_canceled" boolean DEFAULT false NOT NULL,
	"payment_enabled" boolean DEFAULT false NOT NULL,
	"chabad_pay" boolean DEFAULT false NOT NULL,
	"payment_tiers" json,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurring_type" text,
	"recurring_days" json,
	"recurring_start_time" text,
	"recurring_start_ampm" text,
	"recurring_end_time" text,
	"recurring_end_ampm" text,
	"parent_event_id" integer,
	"is_recurring_instance" boolean DEFAULT false NOT NULL,
	"is_free_event" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_title_unique" UNIQUE("title"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"monday_open" text,
	"monday_close" text,
	"monday_use_text" boolean DEFAULT false NOT NULL,
	"monday_text" text,
	"tuesday_open" text,
	"tuesday_close" text,
	"tuesday_use_text" boolean DEFAULT false NOT NULL,
	"tuesday_text" text,
	"wednesday_open" text,
	"wednesday_close" text,
	"wednesday_use_text" boolean DEFAULT false NOT NULL,
	"wednesday_text" text,
	"thursday_open" text,
	"thursday_close" text,
	"thursday_use_text" boolean DEFAULT false NOT NULL,
	"thursday_text" text,
	"friday_open" text,
	"friday_close" text,
	"friday_use_text" boolean DEFAULT false NOT NULL,
	"friday_text" text,
	"saturday_open" text,
	"saturday_close" text,
	"saturday_use_text" boolean DEFAULT false NOT NULL,
	"saturday_text" text,
	"sunday_open" text,
	"sunday_close" text,
	"sunday_use_text" boolean DEFAULT false NOT NULL,
	"sunday_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"artwork_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletters_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_artists" ADD CONSTRAINT "event_artists_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_artists" ADD CONSTRAINT "event_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;