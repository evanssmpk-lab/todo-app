"use client";

import { useState, useTransition } from "react";
import { applyPresetGroupToday, deletePresetGroup } from "@/app/actions/presets";
import { priorityColor } from "@/lib/priorityColor";
import { HARI_PENDEK } from "@/lib/calendar";
import type { Preset, PresetGroup } from "@/lib/types";

export function PresetGroupItem({
  group,
  items,
}: {
  group: PresetGroup;
  items: Preset[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const sortedHari = [...group.hari].sort((a, b) => a - b);

  return (
    <div
      className={`rounded-2xl border border-zinc-800 border-l-4 border-l-violet-600 bg-zinc-900/60 p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-opacity ${
        pending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex flex-1 items-start gap-2 text-left"
        >
          <svg
            viewBox="0 0 24 24"
            className={`mt-1 size-4 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="font-medium text-zinc-50">
              {group.nama}{" "}
              <span className="rounded-full bg-violet-900/50 px-2 py-0.5 text-xs font-normal text-violet-300">
                grup
              </span>
            </p>
            <p className="text-xs text-zinc-500">
              {items.length} kegiatan
              {!expanded &&
                ` — ${items.map((it) => it.aktivitas).join(", ")}`}
            </p>
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
          </div>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => applyPresetGroupToday(group.id))
            }
            className="whitespace-nowrap rounded-lg border border-violet-700 px-3 py-1.5 text-xs text-violet-300 transition-colors hover:bg-violet-950/50"
          >
            Terapkan ke hari ini
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deletePresetGroup(group.id))}
            className="text-xs text-zinc-500 transition-colors hover:text-red-400"
          >
            Hapus grup
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-rise-in mt-3 flex flex-col gap-2 border-t border-zinc-800 pt-3">
          {items.map((item) => {
            const accent = item.prioritas
              ? priorityColor(item.prioritas.urutan)
              : null;
            return (
              <div
                key={item.id}
                style={{ borderLeftColor: accent?.border ?? "#3f3f46" }}
                className="rounded-lg border-l-4 bg-zinc-950/40 p-3"
              >
                <p className="text-sm font-medium text-zinc-100">
                  {item.aktivitas}
                </p>
                {item.jam && (
                  <p className="text-xs text-zinc-500">
                    Jam {item.jam.slice(0, 5)}
                  </p>
                )}
                {item.catatan && (
                  <p className="mt-1 text-xs text-zinc-400">{item.catatan}</p>
                )}
                {(item.kategori || item.prioritas) && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400">
                    {item.kategori && (
                      <>
                        <span
                          className="size-2 rounded-full"
                          style={{
                            background: item.kategori.warna ?? "#71717a",
                          }}
                        />
                        {item.kategori.nama}
                      </>
                    )}
                    {item.prioritas && (
                      <span
                        style={{ color: accent?.text }}
                        className="ml-1 font-medium"
                      >
                        ● {item.prioritas.nama}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
