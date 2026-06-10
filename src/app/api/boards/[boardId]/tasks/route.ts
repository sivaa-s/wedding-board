import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/schema";
import { v4 as uuid } from "uuid";

export async function GET(
  _req: Request,
  { params }: { params: { boardId: string } }
) {
  await ensureSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM tasks
    WHERE board_id = ${params.boardId}
    ORDER BY position ASC, created_at ASC
  `;
  const tasks = rows.map((r) => ({
    ...r,
    assignees: r.assignees ? r.assignees.split(",").filter(Boolean) : [],
  }));
  return NextResponse.json(tasks);
}

export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  await ensureSchema();
  const sql = getDb();
  const body = await req.json();
  const {
    title,
    description = "",
    category = "Other",
    priority = "med",
    status = "todo",
    due_date = null,
    assignees = [],
  } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const posRows = await sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
    FROM tasks WHERE board_id = ${params.boardId} AND status = ${status}
  `;
  const position = posRows[0].next_pos;
  const id = uuid();

  const rows = await sql`
    INSERT INTO tasks (id, board_id, title, description, category, priority, status, due_date, assignees, position)
    VALUES (
      ${id}, ${params.boardId}, ${title.trim()}, ${description},
      ${category}, ${priority}, ${status},
      ${due_date || null}, ${assignees.join(",")}, ${position}
    )
    RETURNING *
  `;
  return NextResponse.json(
    { ...rows[0], assignees: rows[0].assignees ? rows[0].assignees.split(",").filter(Boolean) : [] },
    { status: 201 }
  );
}
