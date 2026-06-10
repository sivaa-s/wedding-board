import { NextResponse } from "next/server";
import { getDb } from "@/lib/schema";

export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  const sql = getDb();
  const { taskId, newStatus, orderedIds } = await req.json();

  await sql`
    UPDATE tasks SET status = ${newStatus}, updated_at = NOW()
    WHERE id = ${taskId} AND board_id = ${params.boardId}
  `;

  for (let i = 0; i < orderedIds.length; i++) {
    await sql`
      UPDATE tasks SET position = ${i}, updated_at = NOW()
      WHERE id = ${orderedIds[i]} AND board_id = ${params.boardId}
    `;
  }

  return NextResponse.json({ success: true });
}
