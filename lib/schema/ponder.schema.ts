import { index, onchainTable, primaryKey, relations } from "ponder";

export const account = onchainTable("account", (t) => ({
  address: t.hex().primaryKey(),
  balance: t.bigint().notNull(),
  isOwner: t.boolean().notNull(),
}));

export const accountRelations = relations(account, ({ many }) => ({
  transferFromEvents: many(transferEvent, { relationName: "from_account" }),
  transferToEvents: many(transferEvent, { relationName: "to_account" }),
}));

export const transferEvent = onchainTable(
  "transfer_event",
  (t) => ({
    id: t.text().primaryKey(),
    amount: t.bigint().notNull(),
    timestamp: t.integer().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
  }),
  (table) => ({
    fromIdx: index("from_index").on(table.from),
  }),
);

export const transferEventRelations = relations(transferEvent, ({ one }) => ({
  fromAccount: one(account, {
    relationName: "from_account",
    fields: [transferEvent.from],
    references: [account.address],
  }),
  toAccount: one(account, {
    relationName: "to_account",
    fields: [transferEvent.to],
    references: [account.address],
  }),
}));

export const allowance = onchainTable(
  "allowance",
  (t) => ({
    owner: t.hex(),
    spender: t.hex(),
    amount: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.owner, table.spender] }),
  }),
);

export const approvalEvent = onchainTable("approval_event", (t) => ({
  id: t.text().primaryKey(),
  amount: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
  owner: t.hex().notNull(),
  spender: t.hex().notNull(),
}));

export const user = onchainTable("user", (t) => ({
  address: t.hex().primaryKey(),
  totalBets: t.integer().notNull(),
  totalWagered: t.bigint().notNull(),
  totalWon: t.bigint().notNull(),
  winCount: t.integer().notNull(),
  lossCount: t.integer().notNull(),
  lastBetTimestamp: t.integer().notNull(),
}));

export const bet = onchainTable(
  "bet",
  (t) => ({
    id: t.text().primaryKey(),
    player: t.hex().notNull(),
    betAmount: t.bigint().notNull(),
    targetMultiplier: t.bigint().notNull(),
    limboMultiplier: t.bigint().notNull(),
    win: t.boolean().notNull(),
    payout: t.bigint().notNull(),
    timestamp: t.integer().notNull(),
  }),
  (table) => ({
    playerIdx: index("player_index").on(table.player),
    timestampIdx: index("timestamp_index").on(table.timestamp),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  bets: many(bet),
}));

export const betRelations = relations(bet, ({ one }) => ({
  user: one(user, {
    fields: [bet.player],
    references: [user.address],
  }),
}));
