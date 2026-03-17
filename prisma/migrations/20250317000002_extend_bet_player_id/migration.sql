-- AlterTable: Extend bets.player_id to support Starknet addresses
ALTER TABLE "bets" ALTER COLUMN "player_id" TYPE VARCHAR(66);
