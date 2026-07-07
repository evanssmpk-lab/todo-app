"use client";

import { HARI_PENDEK, describeHari } from "@/lib/calendar";

export function HariPicker({
  value,
  onChange,
  label = "Ulangi tiap hari",
}: {
  value: number[];
  onChange: (hari: number[]) => void;
  label?: string;
}) {
  function toggle(day: number) {
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day]
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-xs text-zinc-500">
        {label}
        {value.length > 0 ? (
          <>
            : <span className="font-medium text-violet-300">{describeHari(value)}</span>
          </>
        ) : (
          ":"
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {HARI_PENDEK.map((l, day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              value.includes(day)
                ? "border-violet-500 bg-violet-500/20 text-violet-200"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
