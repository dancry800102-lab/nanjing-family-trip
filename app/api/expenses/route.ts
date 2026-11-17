import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";

const members = ["李文龍", "馬僖慧", "李文斌", "黃富美", "李素玲", "蔡璧燦", "李素珍", "陳怡君"];
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { ...corsHeaders, ...init?.headers } });
}

export async function GET() {
  const result = await env.DB.prepare(`
    SELECT id, title, amount, payer, currency, settled, split_mode,
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
      currency: row.currency === "CNY" ? "CNY" : "TWD",
      settled: Number(row.settled) === 1,
      splitMode: row.split_mode === "all" ? "all" : "custom",
      participants,
      createdAt: row.createdAt,
    };
  });
  return json(expenses);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;
  const title = String(body.title ?? "").trim().slice(0, 80);
  const amount = Number(body.amount);
  const payer = String(body.payer ?? "");
  const currency = body.currency === "CNY" ? "CNY" : body.currency === "TWD" ? "TWD" : "";
  const splitMode = body.splitMode === "custom" ? "custom" : "all";
  const participants = splitMode === "custom" && Array.isArray(body.participants)
    ? [...new Set(body.participants.map(String))].filter((name) => members.includes(name))
    : [];
  if (!title || !Number.isFinite(amount) || amount <= 0 || amount > 10_000_000 || !members.includes(payer) || !currency || (splitMode === "custom" && participants.length === 0)) {
    return json({ error: "invalid expense" }, { status: 400 });
  }
  const storedMode = splitMode === "custom" ? "single" : "all";
  const beneficiary = splitMode === "custom" ? JSON.stringify(participants) : null;
  const result = await env.DB.prepare(`
    INSERT INTO expenses (title, amount, payer, currency, split_mode, beneficiary)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(title, amount, payer, currency, storedMode, beneficiary).run();
  return json({ id: result.meta.last_row_id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0 || typeof body.settled !== "boolean") {
    return json({ error: "invalid settlement update" }, { status: 400 });
  }
  await env.DB.prepare("UPDATE expenses SET settled = ? WHERE id = ?")
    .bind(body.settled ? 1 : 0, id).run();
  return json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return json({ error: "invalid id" }, { status: 400 });
  await env.DB.prepare("DELETE FROM expenses WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
