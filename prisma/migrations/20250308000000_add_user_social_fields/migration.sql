-- Add social display fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twitter_username" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "farcaster_username" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" VARCHAR(512);
