-- CreateTable
CREATE TABLE "wallets" (
    "user_id" VARCHAR(255) NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "encrypted_private_key" TEXT NOT NULL,
    "created_at" BIGINT NOT NULL,
    "balance" VARCHAR(78) NOT NULL DEFAULT '0',
    "last_used" BIGINT,
    "created_at_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_last_used_idx" ON "wallets"("last_used");

-- CreateIndex
CREATE INDEX "wallets_created_at_idx" ON "wallets"("created_at");
