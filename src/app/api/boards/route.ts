import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/schema";
import { v4 as uuid } from "uuid";

export async function GET() {
  await ensureSchema();
  const sql = getDb();
  const rows = await sql`SELECT * FROM boards ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await ensureSchema();
  const sql = getDb();
  const body = await req.json();
  const { name = "Wedding Board", couple_names = "", wedding_date = null } = body;
  const id = uuid();
  const rows = await sql`
    INSERT INTO boards (id, name, couple_names, wedding_date)
    VALUES (${id}, ${name}, ${couple_names}, ${wedding_date})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
