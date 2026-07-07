"use client";

import { useState } from "react";
import { Popover } from "@/components/ui/Popover";
import {
  BULAN,
  HARI_PENDEK,
  buildMonthGrid,
  parseISODate,
  toISODate,
} from "@/lib/calendar";
import { jakartaNow } from "@/lib/tz";

function todayParts() {
  const now = jakartaNow();
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
}

export function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const parsed = parseISODate(value);
  const today = todayParts();
  const [viewYear, setViewYear] = useState(parsed?.y ?? today.y);
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? today.m);

  const cells = buildMonthGrid(viewYear, viewMonth);

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  const label = parsed
    ? new Date(parsed.y, parsed.m, parsed.d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pilih tanggal";

  return (
    <Popover
      trigger={({ open }) => (
        <div
          className={`flex w-full items-center gap-2 rounded-lg border bg-zinc-800/80 px-3 py-2 text-sm transition-colors ${
            open
              ? "border-violet-500 ring-2 ring-violet-500/30"
              : "border-zinc-700 hover:border-zinc-600"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 shrink-0 text-zinc-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
          </svg>
          <span className={parsed ? "text-zinc-50" : "text-zinc-500"}>
            {label}
          </span>
        </div>
      )}
    >
      {(close) => (
        <div className="w-64 rounded-xl border border-zinc-700 bg-zinc-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-md px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-zinc-100">
              {BULAN[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-md px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
            {HARI_PENDEK.map((h) => (
              <div key={h} className="py-1">
                {h}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const isToday =
                day === today.d &&
                viewMonth === today.m &&
                viewYear === today.y;
              const isSelected =
                parsed &&
                day === parsed.d &&
                viewMonth === parsed.m &&
                viewYear === parsed.y;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toISODate(viewYear, viewMonth, day));
                    close();
                  }}
                  className={`aspect-square rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 font-medium text-white"
                      : isToday
                        ? "border border-violet-500 text-violet-300"
                        : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(toISODate(today.y, today.m, today.d));
              setViewYear(today.y);
              setViewMonth(today.m);
              close();
            }}
            className="mt-2 w-full rounded-lg border border-zinc-700 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-500 hover:text-violet-300"
          >
            Hari ini
          </button>
        </div>
      )}
    </Popover>
  );
}
