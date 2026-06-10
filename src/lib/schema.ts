import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No database URL found. Set POSTGRES_URL in environment variables.");
  return neon(url);
}

export async function ensureSchema() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS boards (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL DEFAULT 'Wedding Board',
      couple_names TEXT NOT NULL DEFAULT '',
      wedding_date DATE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT PRIMARY KEY,
      board_id    TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category    TEXT NOT NULL DEFAULT 'Other',
      priority    TEXT NOT NULL DEFAULT 'med',
      status      TEXT NOT NULL DEFAULT 'todo',
      due_date    DATE,
      assignees   TEXT NOT NULL DEFAULT '',
      position    INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS tasks_board_id_idx ON tasks(board_id)`;
}

export { getDb };
