-- ============================================
-- Limbo Game - Wallet Database Schema
-- ============================================
-- PostgreSQL Schema for Server-Side Wallets
-- Run this to create the database and tables

-- Create database (run as postgres superuser)
-- CREATE DATABASE limbo_wallets;

-- Connect to the database
-- \c limbo_wallets;

-- ============================================
-- Wallets Table
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
    -- Primary identifier (Farcaster FID or other user ID)
    user_id VARCHAR(255) PRIMARY KEY,
    
    -- Ethereum wallet address
    address VARCHAR(42) NOT NULL UNIQUE,
    
    -- Encrypted private key (AES-256-GCM encrypted)
    encrypted_private_key TEXT NOT NULL,
    
    -- Unix timestamp (milliseconds) when wallet was created
    created_at BIGINT NOT NULL,
    
    -- Cached balance in wei (as string to handle big numbers)
    balance VARCHAR(78) DEFAULT '0',
    
    -- Unix timestamp (milliseconds) of last transaction
    last_used BIGINT,
    
    -- Timestamp fields for database management
    created_at_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes
-- ============================================

-- Index on address for lookups
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);

-- Index on last_used for analytics/cleanup
CREATE INDEX IF NOT EXISTS idx_wallets_last_used ON wallets(last_used);

-- Index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_wallets_created_at ON wallets(created_at);

-- ============================================
-- Triggers
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE
    ON wallets FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Transaction History Table (Optional)
-- ============================================
-- Uncomment to track transaction history

-- CREATE TABLE IF NOT EXISTS wallet_transactions (
--     id SERIAL PRIMARY KEY,
--     user_id VARCHAR(255) REFERENCES wallets(user_id) ON DELETE CASCADE,
--     tx_hash VARCHAR(66) NOT NULL,
--     tx_type VARCHAR(50) NOT NULL, -- 'bet', 'withdraw', 'deposit'
--     amount VARCHAR(78) NOT NULL,
--     status VARCHAR(20) NOT NULL, -- 'pending', 'confirmed', 'failed'
--     block_number BIGINT,
--     gas_used VARCHAR(78),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     confirmed_at TIMESTAMP
-- );

-- CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON wallet_transactions(user_id);
-- CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON wallet_transactions(tx_hash);
-- CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON wallet_transactions(created_at);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE wallets IS 'Stores encrypted server-side wallets for users';
COMMENT ON COLUMN wallets.user_id IS 'User identifier (Farcaster FID or other)';
COMMENT ON COLUMN wallets.address IS 'Ethereum wallet address (0x...)';
COMMENT ON COLUMN wallets.encrypted_private_key IS 'AES-256-GCM encrypted private key';
COMMENT ON COLUMN wallets.balance IS 'Cached balance in wei (string for BigInt support)';
COMMENT ON COLUMN wallets.last_used IS 'Unix timestamp of last transaction (milliseconds)';

-- ============================================
-- Sample Queries
-- ============================================

-- Get wallet by user ID
-- SELECT * FROM wallets WHERE user_id = 'fid-12345';

-- Get wallet by address
-- SELECT * FROM wallets WHERE address = '0x1234...';

-- Get all wallets with recent activity (last 7 days)
-- SELECT * FROM wallets WHERE last_used > EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days') * 1000;

-- Get wallets created today
-- SELECT * FROM wallets WHERE created_at_timestamp::date = CURRENT_DATE;

-- Count total wallets
-- SELECT COUNT(*) FROM wallets;

-- ============================================
-- Cleanup Queries (Use with caution!)
-- ============================================

-- Delete inactive wallets (no activity in 90 days)
-- DELETE FROM wallets WHERE last_used < EXTRACT(EPOCH FROM NOW() - INTERVAL '90 days') * 1000;

-- ============================================
-- Backup Command
-- ============================================

-- pg_dump limbo_wallets > backup_$(date +%Y%m%d).sql

-- ============================================
-- Restore Command
-- ============================================

-- psql limbo_wallets < backup_20241015.sql

