import type { Task } from "@/lib/db";
import { COLUMNS } from "@/lib/db";

export default function StatsBar({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const done  = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) => t.status !== "done" && t.due_date && new Date(t.due_date) < new Date()
  ).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-6 overflow-x-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Progress</span>
          <span className="text-sm font-semibold text-gray-800">{pct}%</span>
        </div>
        <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="w-px h-8 bg-gray-100 flex-shrink-0" />

      {/* Per-column counts */}
      {COLUMNS.map((col) => {
        const count = tasks.filter((t) => t.status === col.id).length;
        return (
          <div key={col.id} className="flex flex-col flex-shrink-0">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{col.label}</span>
            <span className="text-sm font-semibold" style={{ color: col.color }}>{count}</span>
          </div>
        );
      })}

      <div className="w-px h-8 bg-gray-100 flex-shrink-0" />

      {/* Overdue */}
      <div className="flex flex-col flex-shrink-0">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Overdue</span>
        <span className={`text-sm font-semibold ${overdue > 0 ? "text-red-500" : "text-gray-300"}`}>{overdue}</span>
      </div>

      {/* Total */}
      <div className="flex flex-col flex-shrink-0">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total</span>
        <span className="text-sm font-semibold text-gray-700">{total}</span>
      </div>
    </div>
  );
}
