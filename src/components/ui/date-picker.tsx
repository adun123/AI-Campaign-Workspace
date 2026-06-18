"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function DatePicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    onChange(d.toISOString().split("T")[0]);
    setOpen(false);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center gap-2 rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
      >
        <Calendar className="h-3.5 w-3.5 text-text-muted" />
        <span className={value ? "text-text-primary" : "text-text-muted/70"}>
          {selected ? selected.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }) : placeholder ?? "Select date"}
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-[100] mb-1 w-64 rounded-card border bg-surface p-3 shadow-soft">
          <div className="flex items-center justify-between">
            <button type="button" onClick={prev} className="rounded-control p-1 text-text-muted hover:bg-surface-elevated hover:text-text-primary" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-xs font-semibold text-text-primary">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={next} className="rounded-control p-1 text-text-muted hover:bg-surface-elevated hover:text-text-primary" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-xs">
            {DAYS.map((d) => <div key={d} className="py-1 font-medium text-text-muted">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === dateStr;
              const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`rounded-control py-1.5 text-xs transition ${isSelected ? "bg-primary text-white" : isToday ? "bg-accent/15 text-accent font-semibold" : "text-text-primary hover:bg-surface-elevated"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
