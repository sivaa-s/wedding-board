"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Task, Board } from "@/lib/db";
import { COLUMNS, CATEGORIES, CATEGORY_COLORS, PRIORITY_META } from "@/lib/db";
import TaskModal from "@/components/TaskModal";
import TaskCard from "@/components/TaskCard";
import StatsBar from "@/components/StatsBar";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string>("todo");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const [bRes, tRes] = await Promise.all([
      fetch(`/api/boards`),
      fetch(`/api/boards/${boardId}/tasks`),
    ]);
    const boards: Board[] = await bRes.json();
    const b = boards.find((x) => x.id === boardId) || null;
    setBoard(b);
    setTasks(await tRes.json());
    setLoading(false);
  }, [boardId]);

  useEffect(() => { load(); }, [load]);

  function openAdd(status = "todo") {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }
  function openEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSave(data: Partial<Task>) {
    if (editingTask) {
      const res = await fetch(`/api/boards/${boardId}/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const res = await fetch(`/api/boards/${boardId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: defaultStatus }),
      });
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
    }
    setModalOpen(false);
  }

  async function handleDelete(taskId: string) {
    await fetch(`/api/boards/${boardId}/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setModalOpen(false);
  }

  // Drag and drop
  function onDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("taskId", taskId);
    setDraggingId(taskId);
  }
  function onDragEnd() { setDraggingId(null); setDragOver(null); }

  async function onDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistically update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: colId as Task["status"] } : t));
    setDragOver(null);

    const orderedIds = tasks
      .filter((t) => t.status === colId || t.id === taskId)
      .map((t) => t.id);

    await fetch(`/api/boards/${boardId}/tasks/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, newStatus: colId, orderedIds }),
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = tasks.filter((t) => {
    const matchCat = filter === "all" || t.category === filter;
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignees.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-semibold text-gray-800 flex items-center gap-1.5 hover:text-pink-600 transition-colors">
            <span className="text-pink-500">♡</span>
            <span>{board?.name || "Wedding Board"}</span>
          </a>
          {board?.couple_names && (
            <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-2.5 py-0.5">
              {board.couple_names}
            </span>
          )}
          {board?.wedding_date && (
            <span className="text-xs text-gray-400">
              {new Date(board.wedding_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
            <ShareIcon />
            {copied ? "Copied!" : "Share board"}
          </button>
          <button onClick={() => openAdd()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors"
            style={{ background: "var(--brand)" }}>
            <PlusIcon />
            Add task
          </button>
        </div>
      </header>

      {/* Stats */}
      <StatsBar tasks={tasks} />

      {/* Filters */}
      <div className="px-5 py-2.5 flex items-center gap-2 flex-wrap border-b border-gray-100 bg-white">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks or assignees…"
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:border-pink-300"
        />
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {["all", ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === cat
                ? "bg-pink-50 border-pink-400 text-pink-600 font-medium"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-4 h-full" style={{ minWidth: `${COLUMNS.length * 280}px` }}>
          {COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id);
            const isDragOver = dragOver === col.id;
            return (
              <div key={col.id} className="flex flex-col flex-1 min-w-[260px] max-w-[320px]"
                onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
                onDrop={(e) => onDrop(e, col.id)}>
                {/* Column header */}
                <div className={`rounded-xl px-3 py-2.5 mb-2 flex items-center justify-between transition-colors ${
                  isDragOver ? "bg-pink-50" : "bg-gray-100"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs font-medium text-gray-700">{col.label}</span>
                    <span className="text-xs bg-white text-gray-500 border border-gray-200 rounded-full px-1.5 py-0.5 leading-none">
                      {colTasks.length}
                    </span>
                  </div>
                  <button onClick={() => openAdd(col.id)}
                    className="text-gray-400 hover:text-pink-500 transition-colors p-0.5 rounded">
                    <PlusIcon size={14} />
                  </button>
                </div>

                {/* Cards */}
                <div className={`flex-1 flex flex-col gap-2 min-h-[200px] rounded-xl p-1 transition-colors ${
                  isDragOver ? "bg-pink-50/60" : ""
                }`}>
                  {colTasks.length === 0 && !isDragOver && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-gray-300">Drop tasks here</p>
                    </div>
                  )}
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      dragging={draggingId === task.id}
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => openEdit(task)}
                    />
                  ))}
                  {isDragOver && (
                    <div className="border-2 border-dashed border-pink-300 rounded-lg h-20 flex items-center justify-center">
                      <p className="text-xs text-pink-400">Drop here</p>
                    </div>
                  )}
                </div>

                {/* Add task */}
                <button onClick={() => openAdd(col.id)}
                  className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                  <PlusIcon size={13} /> Add task
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultStatus={defaultStatus}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function PlusIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
