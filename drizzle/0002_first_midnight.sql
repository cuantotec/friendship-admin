CREATE TABLE "artist_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"specialty" text,
	"message" text,
	"code" text NOT NULL,
	"invited_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '7 days',
	CONSTRAINT "artist_invitations_code_unique" UNIQUE("code")
);
