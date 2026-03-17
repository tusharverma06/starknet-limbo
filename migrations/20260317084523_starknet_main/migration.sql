-- CreateTable
CREATE TABLE "custodial_wallets" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custodial_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" VARCHAR(66) NOT NULL,
    "custodial_wallet_id" TEXT NOT NULL,
    "session_id" TEXT,
    "siwe_message" TEXT,
    "siwe_signature" TEXT,
    "siwe_expires_at" TIMESTAMP(3),
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "custodial_wallet_id" VARCHAR(255) NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "encrypted_private_key" TEXT NOT NULL,
    "created_at" BIGINT NOT NULL,
    "balance" VARCHAR(78) NOT NULL DEFAULT '0',
    "locked_balance" VARCHAR(78) NOT NULL DEFAULT '0',
    "last_used" BIGINT,
    "created_at_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("custodial_wallet_id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" SERIAL NOT NULL,
    "custodial_wallet_id" VARCHAR(255) NOT NULL,
    "tx_hash" VARCHAR(66),
    "tx_type" VARCHAR(50) NOT NULL,
    "amount" VARCHAR(78) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "block_number" BIGINT,
    "gas_used" VARCHAR(78),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "player_id" VARCHAR(42) NOT NULL,
    "server_seed_hash" VARCHAR(64) NOT NULL,
    "server_seed" VARCHAR(64),
    "client_seed" VARCHAR(64),
    "random_value" VARCHAR(64) NOT NULL,
    "game_number" VARCHAR(78) NOT NULL,
    "wager" VARCHAR(78) NOT NULL,
    "target_multiplier" VARCHAR(20) NOT NULL,
    "limbo_multiplier" VARCHAR(20),
    "outcome" VARCHAR(10) NOT NULL,
    "payout" VARCHAR(78) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "eth_price_usd" VARCHAR(20),
    "wager_usd" VARCHAR(20),
    "payout_usd" VARCHAR(20),
    "bet_signature" TEXT,
    "bet_message" TEXT,
    "signature" TEXT,
    "tx_hash" VARCHAR(66),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_id" VARCHAR(50) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custodial_wallets_address_key" ON "custodial_wallets"("address");

-- CreateIndex
CREATE INDEX "custodial_wallets_address_idx" ON "custodial_wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "users_wallet_address_idx" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "users_custodial_wallet_id_idx" ON "users"("custodial_wallet_id");

-- CreateIndex
CREATE INDEX "users_total_points_idx" ON "users"("total_points");

-- CreateIndex
CREATE INDEX "users_session_id_idx" ON "users"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_last_used_idx" ON "wallets"("last_used");

-- CreateIndex
CREATE INDEX "wallets_created_at_idx" ON "wallets"("created_at");

-- CreateIndex
CREATE INDEX "wallet_transactions_custodial_wallet_id_idx" ON "wallet_transactions"("custodial_wallet_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_tx_hash_idx" ON "wallet_transactions"("tx_hash");

-- CreateIndex
CREATE INDEX "wallet_transactions_created_at_idx" ON "wallet_transactions"("created_at");

-- CreateIndex
CREATE INDEX "bets_user_id_idx" ON "bets"("user_id");

-- CreateIndex
CREATE INDEX "bets_player_id_idx" ON "bets"("player_id");

-- CreateIndex
CREATE INDEX "bets_created_at_idx" ON "bets"("created_at");

-- CreateIndex
CREATE INDEX "bets_status_idx" ON "bets"("status");

-- CreateIndex
CREATE INDEX "user_tasks_user_id_idx" ON "user_tasks"("user_id");

-- CreateIndex
CREATE INDEX "user_tasks_task_id_idx" ON "user_tasks"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tasks_user_id_task_id_key" ON "user_tasks"("user_id", "task_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "referrals_referred_id_idx" ON "referrals"("referred_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referrer_id_referred_id_key" ON "referrals"("referrer_id", "referred_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_custodial_wallet_id_fkey" FOREIGN KEY ("custodial_wallet_id") REFERENCES "custodial_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_custodial_wallet_id_fkey" FOREIGN KEY ("custodial_wallet_id") REFERENCES "custodial_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_custodial_wallet_id_fkey" FOREIGN KEY ("custodial_wallet_id") REFERENCES "wallets"("custodial_wallet_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
