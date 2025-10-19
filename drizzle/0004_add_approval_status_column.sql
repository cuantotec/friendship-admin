-- Add approval_status column to artworks table
ALTER TABLE "artworks" ADD COLUMN "approval_status" text DEFAULT 'pending' NOT NULL;
