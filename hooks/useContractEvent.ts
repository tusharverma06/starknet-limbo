import { account } from "@/lib/schema/ponder.schema";
import { desc } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";

const query = usePonderQuery({
  queryFn: (db) =>
    db.select().from(account).orderBy(desc(account.balance)),
});
