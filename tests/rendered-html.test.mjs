import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("dual-currency ledger keeps TWD and CNY separate", async () => {
  const [app, route, schema] = await Promise.all([
    read("../app/trip-app.tsx"),
    read("../app/api/expenses/route.ts"),
    read("../db/schema.ts"),
  ]);

  assert.match(app, /type Currency = "TWD" \| "CNY"/);
  assert.match(app, /新台幣總支出/);
  assert.match(app, /人民幣總支出/);
  assert.match(app, /新台幣與人民幣分開記錄、分開結算/);
  assert.match(route, /row\.currency === "CNY" \? "CNY" : "TWD"/);
  assert.match(route, /INSERT INTO expenses \(title, amount, payer, currency,/);
  assert.match(schema, /currency: text\("currency"\)\.notNull\(\)\.default\("TWD"\)/);
});

test("legacy expenses default to TWD and the migration is bounded", async () => {
  const migration = await read("../drizzle/0001_massive_maria_hill.sql");
  assert.equal(migration.trim(), "ALTER TABLE `expenses` ADD `currency` text DEFAULT 'TWD' NOT NULL;");
});

test("expense deletion does not call the removed table initializer", async () => {
  const route = await read("../app/api/expenses/route.ts");
  assert.doesNotMatch(route, /ensureTable\(\)/);
  assert.match(route, /new URL\(request\.url\)\.searchParams\.get\("id"\)/);
});
