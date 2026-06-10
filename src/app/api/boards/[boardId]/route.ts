import { NextResponse } from "next/server";
import { getDb } from "@/lib/schema";

export async function PATCH(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  const sql = getDb();
  const { name, couple_names, wedding_date } = await req.json();
  const rows = await sql`
    UPDATE boards SET
      name         = COALESCE(${name         ?? null}, name),
      couple_names = COALESCE(${couple_names ?? null}, couple_names),
      wedding_date = CASE WHEN ${wedding_date !== undefined} THEN ${wedding_date || null} ELSE wedding_date END
    WHERE id = ${params.boardId}
    RETURNING *
  `;
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { boardId: string } }
) {
  const sql = getDb();
  await sql`DELETE FROM boards WHERE id = ${params.boardId}`;
  return NextResponse.json({ success: true });
}