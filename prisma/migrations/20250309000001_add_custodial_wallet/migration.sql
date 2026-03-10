-- ================================
-- Migration: Add CustodialWallet and refactor schema
-- ================================

-- STEP 1: Create CustodialWallet table
CREATE TABLE IF NOT EXISTS "custodial_wallets" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "custodial_wallets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "custodial_wallets_address_key" ON "custodial_wallets"("address");
CREATE INDEX IF NOT EXISTS "custodial_wallets_address_idx" ON "custodial_wallets"("address");

-- STEP 2: Migrate existing Wallet records to CustodialWallet
-- For each existing wallet, create a corresponding custodial wallet
INSERT INTO "custodial_wallets" (id, address, created_at, updated_at)
SELECT
    user_id,
    address,
    COALESCE(created_at_timestamp, NOW()),
    COALESCE(updated_at, NOW())
FROM "wallets"
WHERE NOT EXISTS (
    SELECT 1 FROM "custodial_wallets" WHERE "custodial_wallets".address = "wallets".address
);

-- STEP 3: Add custodial_wallet_id column to users (NULLABLE first)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custodial_wallet_id" TEXT;

-- STEP 4: Populate custodial_wallet_id for users that have wallets
UPDATE "users" u
SET custodial_wallet_id = w.user_id
FROM "wallets" w
WHERE u.id = w.user_id
AND u.custodial_wallet_id IS NULL;

-- STEP 5: For users without wallets, create placeholder custodial wallets
DO $$
DECLARE
    user_rec RECORD;
    cust_id TEXT;
BEGIN
    FOR user_rec IN
        SELECT id FROM "users" WHERE custodial_wallet_id IS NULL
    LOOP
        cust_id := user_rec.id;

        -- Insert custodial wallet if it doesn't exist
        INSERT INTO "custodial_wallets" (id, address, created_at, updated_at)
        VALUES (cust_id, '0xtemp' || substring(cust_id from 1 for 36), NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;

        -- Update user
        UPDATE "users"
        SET custodial_wallet_id = cust_id
        WHERE id = user_rec.id;
    END LOOP;
END $$;

-- STEP 6: Make custodial_wallet_id NOT NULL
ALTER TABLE "users" ALTER COLUMN "custodial_wallet_id" SET NOT NULL;

-- STEP 7: Add index and foreign key for users
CREATE INDEX IF NOT EXISTS "users_custodial_wallet_id_idx" ON "users"("custodial_wallet_id");
ALTER TABLE "users" ADD CONSTRAINT "users_custodial_wallet_id_fkey"
    FOREIGN KEY ("custodial_wallet_id") REFERENCES "custodial_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- STEP 8: Update wallets table
-- Add new custodial_wallet_id column (temporarily nullable)
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "temp_custodial_id" TEXT;

-- Populate it from user_id (which should match custodial wallet IDs now)
UPDATE "wallets" SET temp_custodial_id = user_id;

-- Drop old foreign key constraint
ALTER TABLE "wallets" DROP CONSTRAINT IF EXISTS "wallets_user_id_fkey";

-- Drop the old primary key
ALTER TABLE "wallets" DROP CONSTRAINT IF EXISTS "wallets_pkey";

-- Drop the old user_id column
ALTER TABLE "wallets" DROP COLUMN IF EXISTS "user_id";

-- Rename temp column to custodial_wallet_id
ALTER TABLE "wallets" RENAME COLUMN "temp_custodial_id" TO "custodial_wallet_id";

-- Make it NOT NULL
ALTER TABLE "wallets" ALTER COLUMN "custodial_wallet_id" SET NOT NULL;

-- Add new primary key
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("custodial_wallet_id");

-- Add foreign key
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_custodial_wallet_id_fkey"
    FOREIGN KEY ("custodial_wallet_id") REFERENCES "custodial_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- STEP 9: Update wallet_transactions table
-- Add new column (temporarily nullable)
ALTER TABLE "wallet_transactions" ADD COLUMN IF NOT EXISTS "temp_custodial_id" TEXT;

-- Populate from user_id
UPDATE "wallet_transactions" SET temp_custodial_id = user_id;

-- Drop old constraint and column
ALTER TABLE "wallet_transactions" DROP CONSTRAINT IF EXISTS "wallet_transactions_user_id_fkey";
DROP INDEX IF EXISTS "wallet_transactions_user_id_idx";
ALTER TABLE "wallet_transactions" DROP COLUMN IF EXISTS "user_id";

-- Rename and finalize
ALTER TABLE "wallet_transactions" RENAME COLUMN "temp_custodial_id" TO "custodial_wallet_id";
ALTER TABLE "wallet_transactions" ALTER COLUMN "custodial_wallet_id" SET NOT NULL;

-- Add index and foreign key
CREATE INDEX IF NOT EXISTS "wallet_transactions_custodial_wallet_id_idx" ON "wallet_transactions"("custodial_wallet_id");
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_custodial_wallet_id_fkey"
    FOREIGN KEY ("custodial_wallet_id") REFERENCES "custodial_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- STEP 10: Clean up old columns and tables
ALTER TABLE "users" DROP COLUMN IF EXISTS "session_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "server_wallet_address";
DROP INDEX IF EXISTS "users_session_id_idx";
DROP INDEX IF EXISTS "users_server_wallet_address_idx";
DROP TABLE IF EXISTS "session_wallets";
