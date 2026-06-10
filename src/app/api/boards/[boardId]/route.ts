import { NextResponse } from "next/server";
import { getDb } from "@/lib/schema";

export async function DELETE(
  _req: Request,
  { params }: { params: { boardId: string } }
) {
  const sql = getDb();
  await sql`DELETE FROM boards WHERE id = ${params.boardId}`;
  return NextResponse.json({ success: true });
}