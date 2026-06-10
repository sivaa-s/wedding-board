import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Body: { taskId, newStatus, orderedIds }
// orderedIds = all task IDs in the destination column, in their new order
export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  const { taskId, newStatus, orderedIds } = await req.json();

  // Update the moved task's status
  await sql`
    UPDATE tasks SET status = ${newStatus}, updated_at = NOW()
    WHERE id = ${taskId} AND board_id = ${params.boardId}
  `;

  // Rewrite positions for the destination column
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`
      UPDATE tasks SET position = ${i}, updated_at = NOW()
      WHERE id = ${orderedIds[i]} AND board_id = ${params.boardId}
    `;
  }

  return NextResponse.json({ success: true });
}
