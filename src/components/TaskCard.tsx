import type { Task } from "@/lib/db";
import { CATEGORY_COLORS, PRIORITY_META } from "@/lib/db";

interface Props {
  task: Task;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

export default function TaskCard({ task, dragging, onDragStart, onDragEnd, onClick }: Props) {
  const isOverdue =
    task.status !== "done" &&
    task.due_date &&
    new Date(task.due_date) < new Date();

  const catClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS["Other"];
  const pri = PRIORITY_META[task.priority];

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function initials(email: string) {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  }
  function avatarColor(email: string) {
    const palette = ["#9FE1CB","#F4C0D1","#CECBF6","#FAC775","#B5D4F4","#C0DD97"];
    let h = 0;
    for (const c of email) h = c.charCodeAt(0) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white border rounded-xl p-3 cursor-pointer select-none transition-all group fade-in ${
        dragging
          ? "opacity-40 scale-95 border-pink-300"
          : "border-gray-200 hover:border-pink-300 hover:shadow-sm"
      }`}
    >
      {/* Category tag */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${catClass}`}>
          {task.category}
        </span>
        <span style={{ color: pri.color }} title={pri.label} className="text-[11px] font-medium flex items-center gap-0.5">
          {task.priority === "high" && <ArrowUpIcon />}
          {task.priority === "low"  && <ArrowDownIcon />}
          {task.priority === "med"  && <DashIcon />}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 leading-snug mb-1 group-hover:text-pink-700 transition-colors">
        {task.title}
      </p>

      {/* Description snippet */}
      {task.description && (
        <p className="text-xs text-gray-400 leading-relaxed mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        {task.due_date ? (
          <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
            <CalendarIcon />
            {fmtDate(task.due_date)}
            {isOverdue && <span className="text-[10px] bg-red-50 text-red-400 border border-red-200 rounded px-1">Overdue</span>}
          </span>
        ) : (
          <span />
        )}
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 3).map((a, i) => (
            <div key={i} title={a}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-semibold"
              style={{ background: avatarColor(a), color: "#2C2C2A" }}>
              {initials(a)}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] text-gray-500 font-medium">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function ArrowUpIcon() {
  return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>;
}
function ArrowDownIcon() {
  return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>;
}
function DashIcon() {
  return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M5 12h14"/></svg>;
}
