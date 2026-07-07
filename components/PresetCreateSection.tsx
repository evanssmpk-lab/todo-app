"use client";

import { useState } from "react";
import { PresetForm } from "@/components/PresetForm";
import { PresetGroupForm } from "@/components/PresetGroupForm";
import type { Kategori, Prioritas } from "@/lib/types";

export function PresetCreateSection({
  kategoriList,
  prioritasList,
}: {
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}) {
  const [mode, setMode] = useState<"individu" | "grup">("individu");

  return (
    <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm transition-shadow focus-within:border-violet-800/60">
      <div className="mb-4 inline-flex rounded-lg border border-zinc-700 bg-zinc-800/60 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("individu")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            mode === "individu"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Satu kegiatan
        </button>
        <button
          type="button"
          onClick={() => setMode("grup")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            mode === "grup"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Grup (banyak kegiatan)
        </button>
      </div>

      {mode === "individu" ? (
        <PresetForm kategoriList={kategoriList} prioritasList={prioritasList} />
      ) : (
        <PresetGroupForm
          kategoriList={kategoriList}
          prioritasList={prioritasList}
        />
      )}
    </div>
  );
}
