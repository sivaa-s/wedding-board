"use client";

import { useState, useEffect, useRef } from "react";
import type { Task } from "@/lib/db";
import { COLUMNS, CATEGORIES, PRIORITY_META } from "@/lib/db";

interface Props {
  task: Task | null;
  defaultStatus: string;
  onSave: (data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ task, defaultStatus, onSave, onDelete, onClose }: Props) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || "Venue",
    priority: task?.priority || "med",
    status: task?.status || defaultStatus,
    due_date: task?.due_date ? task.due_date.split("T")[0] : "",
  });
  const [assignees, setAssignees] = useState<string[]>(task?.assignees || []);
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function addAssignee() {
    const v = emailInput.trim().toLowerCase();
    if (!v.includes("@") || !v.includes(".")) { setEmailError("Enter a valid email address"); return; }
    if (assignees.includes(v)) { setEmailError("Already added"); return; }
    setAssignees([...assignees, v]);
    setEmailInput("");
    setEmailError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({ ...form, assignees, due_date: form.due_date || null } as Partial<Task>);
    setSaving(false);
  }

  function avatarColor(email: string) {
    const palette = ["#9FE1CB","#F4C0D1","#CECBF6","#FAC775","#B5D4F4","#C0DD97"];
    let h = 0;
    for (const c of email) h = c.charCodeAt(0) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">{isEdit ? "Edit task" : "New task"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Task title <span className="text-red-400">*</span></label>
            <input
              ref={titleRef}
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Book wedding photographer"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional notes, links, or vendor details…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 resize-none"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white">
                {Object.entries(PRIORITY_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Task["status"] })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white">
                {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Due date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Assign by email</label>
            <div className="flex gap-2">
              <input
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAssignee(); } }}
                placeholder="colleague@email.com"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
              />
              <button type="button" onClick={addAssignee}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                Add
              </button>
            </div>
            {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assignees.map((email) => (
                  <span key={email} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full pl-1 pr-2.5 py-0.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold"
                      style={{ background: avatarColor(email), color: "#2C2C2A" }}>
                      {email.split("@")[0].slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-gray-600 max-w-[140px] truncate">{email}</span>
                    <button type="button" onClick={() => setAssignees(assignees.filter((a) => a !== email))}
                      className="text-gray-300 hover:text-gray-500 ml-0.5 leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {isEdit && (
              <button type="button" onClick={() => task && onDelete(task.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                <TrashIcon /> Delete
              </button>
            )}
            <div className="flex-1" />
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
              style={{ background: saving ? "#e9a0b6" : "var(--brand)" }}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function XIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/></svg>;
}
function TrashIcon() {
  return <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>;
}
