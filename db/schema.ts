import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  amount: real("amount").notNull(),
  payer: text("payer").notNull(),
  splitMode: text("split_mode").notNull(),
  beneficiary: text("beneficiary"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
