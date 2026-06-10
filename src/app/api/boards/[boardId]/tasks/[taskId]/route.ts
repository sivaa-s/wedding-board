import { NextResponse } from "next/server";
import { getDb } from "@/lib/schema";

type Params = { params: { boardId: string; taskId: string } };

export async function PATCH(req: Request, { params }: Params) {
  const sql = getDb();
  const body = await req.json();
  const { title, description, category, priority, status, due_date, assignees, position } = body;

  const rows = await sql`
    UPDATE tasks SET
      title       = COALESCE(${title       ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      category    = COALESCE(${category    ?? null}, category),
      priority    = COALESCE(${priority    ?? null}, priority),
      status      = COALESCE(${status      ?? null}, status),
      due_date    = CASE WHEN ${due_date !== undefined} THEN ${due_date || null} ELSE due_date END,
      assignees   = CASE WHEN ${assignees !== undefined} THEN ${Array.isArray(assignees) ? assignees.join(",") : (assignees ?? "")} ELSE assignees END,
      position    = COALESCE(${position    ?? null}, position),
      updated_at  = NOW()
    WHERE id = ${params.taskId} AND board_id = ${params.boardId}
    RETURNING *
  `;

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...rows[0],
    assignees: rows[0].assignees ? rows[0].assignees.split(",").filter(Boolean) : [],
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const sql = getDb();
  await sql`DELETE FROM tasks WHERE id = ${params.taskId} AND board_id = ${params.boardId}`;
  return NextResponse.json({ success: true });
}
