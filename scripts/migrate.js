// Run once: node scripts/migrate.js
// Or it runs automatically on first API call via ensureSchema()

const { sql } = require("@vercel/postgres");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS boards (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL DEFAULT 'Wedding Board',
      couple_names TEXT NOT NULL DEFAULT '',
      wedding_date DATE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
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
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS tasks_board_id_idx ON tasks(board_id);`;
  await sql`CREATE INDEX IF NOT EXISTS tasks_status_idx   ON tasks(status);`;

  console.log("✅ Migration complete");
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
