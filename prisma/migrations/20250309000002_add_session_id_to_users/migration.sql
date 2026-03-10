-- ============================================
-- Migration: Reintroduce session_id on users
-- ============================================

-- Add session_id column back to users (nullable)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "session_id" TEXT;

-- Create index for quick lookup by session
CREATE INDEX IF NOT EXISTS "users_session_id_idx" ON "users"("session_id");

