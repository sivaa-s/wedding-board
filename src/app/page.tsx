"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Board } from "@/lib/db";

export default function HomePage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "Wedding Board", couple_names: "", wedding_date: "" });

  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then((data) => { setBoards(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const board = await res.json();
    router.push(`/board/${board.id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-pink-300 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-3">♡</div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Wedding Planner</h1>
          <p className="text-gray-500 text-sm">Jira-style task board for your big day</p>
        </div>

        {/* Existing boards */}
        {boards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Your boards</h2>
            <div className="flex flex-col gap-2">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/board/${b.id}`)}
                  className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-pink-300 hover:shadow-sm transition-all text-left group"
                >
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">{b.name}</p>
                    {b.couple_names && <p className="text-sm text-gray-400 mt-0.5">{b.couple_names}</p>}
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create new */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 px-5 rounded-xl border-2 border-dashed border-pink-200 text-pink-500 hover:border-pink-400 hover:bg-pink-50 transition-all text-sm font-medium"
          >
            + Create new board
          </button>
        ) : (
          <form onSubmit={createBoard} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm fade-in">
            <h2 className="text-sm font-medium text-gray-700 mb-4">New board</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Board name</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Wedding Board"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Couple names</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  value={form.couple_names}
                  onChange={(e) => setForm({ ...form, couple_names: e.target.value })}
                  placeholder="e.g. Arjun & Priya"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Wedding date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  value={form.wedding_date}
                  onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: creating ? "#e9a0b6" : "var(--brand)" }}>
                {creating ? "Creating…" : "Create board"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
