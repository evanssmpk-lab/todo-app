"use client";

import { Popover } from "@/components/ui/Popover";

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const QUICK = [
  { label: "Pagi", value: "08:00" },
  { label: "Siang", value: "12:00" },
  { label: "Sore", value: "16:00" },
  { label: "Malam", value: "19:00" },
];

export function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
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
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={value ? "text-zinc-50" : "text-zinc-500"}>
            {value || "Jam (opsional)"}
          </span>
        </div>
      )}
    >
      {(close) => (
        <div className="w-48 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-1 border-b border-zinc-800 p-2">
            {QUICK.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => {
                  onChange(q.value);
                  close();
                }}
                className="rounded-lg px-2 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                {q.label}
                <span className="block text-[10px] text-zinc-500">
                  {q.value}
                </span>
              </button>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onChange(t);
                  close();
                }}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-zinc-800 ${
                  t === value ? "bg-violet-600/20 text-violet-300" : "text-zinc-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                close();
              }}
              className="w-full border-t border-zinc-800 px-3 py-2 text-left text-xs text-zinc-500 transition-colors hover:text-red-400"
            >
              Kosongkan jam
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}
