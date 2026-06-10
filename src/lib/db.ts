export type Priority = "low" | "med" | "high";
export type Status = "todo" | "inprogress" | "review" | "done";

export interface Task {
  id: string;
  board_id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  due_date: string | null;
  assignees: string[]; // stored as comma-separated in DB
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  name: string;
  couple_names: string;
  wedding_date: string | null;
  created_at: string;
}

export const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "todo",       label: "To Do",       color: "#6b7280" },
  { id: "inprogress", label: "In Progress",  color: "#3b82f6" },
  { id: "review",     label: "Review",       color: "#f59e0b" },
  { id: "done",       label: "Done",         color: "#10b981" },
];

export const CATEGORIES = [
  "Venue", "Catering", "Decor", "Attire",
  "Photo/Video", "Music", "Flowers", "Transport", "Other",
];

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  high: { label: "High",   color: "#ef4444" },
  med:  { label: "Medium", color: "#f59e0b" },
  low:  { label: "Low",    color: "#10b981" },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Venue:       "bg-emerald-100 text-emerald-800 border-emerald-300",
  Catering:    "bg-amber-100  text-amber-800  border-amber-300",
  Decor:       "bg-pink-100   text-pink-800   border-pink-300",
  Attire:      "bg-purple-100 text-purple-800 border-purple-300",
  "Photo/Video":"bg-blue-100  text-blue-800   border-blue-300",
  Music:       "bg-green-100  text-green-800  border-green-300",
  Flowers:     "bg-rose-100   text-rose-800   border-rose-300",
  Transport:   "bg-slate-100  text-slate-700  border-slate-300",
  Other:       "bg-gray-100   text-gray-700   border-gray-300",
};
