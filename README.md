# Wedding Board 💍

A Jira-style Kanban board for planning your wedding. Built with Next.js 14 + Vercel Postgres.

## Features
- Four-column Kanban board (To Do → In Progress → Review → Done)
- Drag and drop tasks between columns
- Assign tasks by email address with colour-coded avatars
- Category filters (Venue, Catering, Decor, Attire, Photo/Video, Music, Flowers, Transport)
- Priority levels with visual indicators
- Due dates with overdue highlighting
- Progress stats bar
- Shareable URL — anyone with the link can view and edit
- Multiple boards (create one per event, e.g. Sangeeth + Wedding)

---

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create wedding-board --public --push
# or push manually to your GitHub
```

### 2. Create a Vercel project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Leave all settings as defaults — Vercel detects Next.js automatically
4. Click **Deploy** (it will fail on first deploy — that's expected until you add the DB)

### 3. Add Vercel Postgres
1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database → Postgres**
3. Name it `wedding-board-db`, choose the free tier, click **Create**
4. Click **Connect to Project** — this auto-adds all `POSTGRES_*` env vars
5. Go to **Deployments** and click **Redeploy** on your latest deployment

### 4. Done!
Your board is live at `https://your-project.vercel.app`.

The database schema is created automatically on the first request — no manual migration needed.

---

## Local development

```bash
npm install

# Pull env vars from Vercel (requires Vercel CLI)
npm i -g vercel
vercel link
vercel env pull .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
src/
  app/
    page.tsx                          # Home — board list & create
    board/[boardId]/page.tsx          # Main Kanban board
    api/
      boards/route.ts                 # GET all boards, POST create
      boards/[boardId]/tasks/
        route.ts                      # GET tasks, POST create task
        reorder/route.ts              # POST reorder after drag-drop
        [taskId]/route.ts             # PATCH update, DELETE task
  components/
    TaskCard.tsx                      # Individual card
    TaskModal.tsx                     # Create/edit modal
    StatsBar.tsx                      # Progress summary
  lib/
    db.ts                             # Types, constants, sql client
    schema.ts                         # Auto-migration helper
```
