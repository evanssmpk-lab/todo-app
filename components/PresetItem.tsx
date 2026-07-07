"use client";

import { useTransition } from "react";
import { applyPresetToday, deletePreset } from "@/app/actions/presets";
import { priorityColor } from "@/lib/priorityColor";
import { HARI_PENDEK } from "@/lib/calendar";
import type { Preset } from "@/lib/types";

export function PresetItem({ preset }: { preset: Preset }) {
  const [pending, startTransition] = useTransition();
  const accent = preset.prioritas ? priorityColor(preset.prioritas.urutan) : null;
  const sortedHari = [...preset.hari].sort((a, b) => a - b);

  return (
    <div
      style={{ borderLeftColor: accent?.border ?? "#3f3f46" }}
      className={`rounded-2xl border border-zinc-800 border-l-4 bg-zinc-900/60 p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-opacity ${
        pending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-50">{preset.aktivitas}</p>
          <p className="text-xs text-zinc-500">
            {preset.jam ? `Jam ${preset.jam.slice(0, 5)}` : "Tanpa jam tetap"}
          </p>
          {preset.catatan && (
            <p className="mt-1 text-sm text-zinc-400">{preset.catatan}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {sortedHari.map((d) => (
              <span
                key={d}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300"
              >
                {HARI_PENDEK[d]}
              </span>
            ))}
          </div>
          {(preset.kategori || preset.prioritas) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
              {preset.kategori && (
                <>
                  <span
                    className="size-2 rounded-full"
                    style={{ background: preset.kategori.warna ?? "#71717a" }}
                  />
                  {preset.kategori.nama}
                </>
              )}
              {preset.prioritas && (
                <span style={{ color: accent?.text }} className="ml-1 font-medium">
                  ● {preset.prioritas.nama}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => applyPresetToday(preset.id))}
            className="whitespace-nowrap rounded-lg border border-violet-700 px-3 py-1.5 text-xs text-violet-300 transition-colors hover:bg-violet-950/50"
          >
            Terapkan ke hari ini
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deletePreset(preset.id))}
            className="text-xs text-zinc-500 transition-colors hover:text-red-400"
          >
            Hapus preset
          </button>
        </div>
      </div>
    </div>
  );
}
