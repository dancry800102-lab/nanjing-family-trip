import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";

const members = ["李文龍", "馬僖慧", "李文斌", "黃富美", "李素玲", "蔡壁燦", "李素貞", "陳怡君"];

async function ensureTable() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      payer TEXT NOT NULL,
      split_mode TEXT NOT NULL CHECK (split_mode IN ('all', 'single')),
      beneficiary TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function GET() {
  await ensureTable();
  const result = await env.DB.prepare(`
    SELECT id, title, amount, payer, split_mode,
           beneficiary, created_at AS createdAt
    FROM expenses ORDER BY id DESC
  `).all();
  const expenses = result.results.map((row) => {
    const raw = String(row.beneficiary ?? "");
    let participants: string[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        participants = Array.isArray(parsed) ? parsed.filter((name): name is string => typeof name === "string" && members.includes(name)) : [];
      } catch {
        if (members.includes(raw)) participants = [raw];
      }
    }
    return {
      id: row.id,
      title: row.title,
      amount: row.amount,
      payer: row.payer,
      splitMode: row.split_mode === "all" ? "all" : "custom",
      participants,
      createdAt: row.createdAt,
    };
  });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  await ensureTable();
  const body = await request.json() as Record<string, unknown>;
  const title = String(body.title ?? "").trim().slice(0, 80);
  const amount = Number(body.amount);
  const payer = String(body.payer ?? "");
  const splitMode = body.splitMode === "custom" ? "custom" : "all";
  const participants = splitMode === "custom" && Array.isArray(body.participants)
    ? [...new Set(body.participants.map(String))].filter((name) => members.includes(name))
    : [];
  if (!title || !Number.isFinite(amount) || amount <= 0 || amount > 10_000_000 || !members.includes(payer) || (splitMode === "custom" && participants.length === 0)) {
    return NextResponse.json({ error: "invalid expense" }, { status: 400 });
  }
  const storedMode = splitMode === "custom" ? "single" : "all";
  const beneficiary = splitMode === "custom" ? JSON.stringify(participants) : null;
  const result = await env.DB.prepare(`
    INSERT INTO expenses (title, amount, payer, split_mode, beneficiary)
    VALUES (?, ?, ?, ?, ?)
  `).bind(title, amount, payer, storedMode, beneficiary).run();
  return NextResponse.json({ id: result.meta.last_row_id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await ensureTable();
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  await env.DB.prepare("DELETE FROM expenses WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
