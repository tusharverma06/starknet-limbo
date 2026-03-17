-- AlterTable: Extend custodial_wallets.address to support Starknet addresses
ALTER TABLE "custodial_wallets" ALTER COLUMN "address" TYPE VARCHAR(66);

-- AlterTable: Extend wallets.address to support Starknet addresses
ALTER TABLE "wallets" ALTER COLUMN "address" TYPE VARCHAR(66);
