"use client";

import { useState, useTransition } from "react";
import { createPresetGroup } from "@/app/actions/presets";
import { CategoryPicker } from "@/components/CategoryPicker";
import { PrioritySlider } from "@/components/PrioritySlider";
import { TimePicker } from "@/components/TimePicker";
import { HariPicker } from "@/components/HariPicker";
import type { Kategori, Prioritas, PresetItemInput } from "@/lib/types";

const inputClass =
  "rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30";

function emptyItem(): PresetItemInput {
  return {
    aktivitas: "",
    jam: null,
    catatan: null,
    kategori_id: null,
    prioritas_id: null,
  };
}

export function PresetGroupForm({
  kategoriList,
  prioritasList,
}: {
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}) {
  const [nama, setNama] = useState("");
  const [hari, setHari] = useState<number[]>([]);
  const [items, setItems] = useState<PresetItemInput[]>([emptyItem()]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function updateItem(index: number, patch: Partial<PresetItemInput>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    setError("");
    if (!nama.trim()) {
      setError("Nama grup wajib diisi.");
      return;
    }
    if (hari.length === 0) {
      setError("Pilih minimal 1 hari.");
      return;
    }
    if (items.some((it) => !it.aktivitas.trim())) {
      setError("Semua kegiatan wajib diisi nama aktivitasnya.");
      return;
    }
    startTransition(async () => {
      await createPresetGroup({ nama, hari, items });
      setNama("");
      setHari([]);
      setItems([emptyItem()]);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Nama grup, misal: Rutinitas Rabu"
        className={inputClass}
      />

      <HariPicker value={hari} onChange={setHari} />

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 sm:grid-cols-6"
          >
            <div className="flex items-center justify-between sm:col-span-6">
              <p className="text-xs text-zinc-500">Kegiatan {index + 1}</p>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-zinc-500 hover:text-red-400"
                >
                  Hapus kegiatan ini
                </button>
              )}
            </div>

            <input
              value={item.aktivitas}
              onChange={(e) => updateItem(index, { aktivitas: e.target.value })}
              placeholder="Aktivitasnya apa?"
              className={`${inputClass} sm:col-span-4`}
            />
            <div className="sm:col-span-2">
              <TimePicker
                value={item.jam ?? ""}
                onChange={(v) => updateItem(index, { jam: v || null })}
              />
            </div>

            <input
              value={item.catatan ?? ""}
              onChange={(e) =>
                updateItem(index, { catatan: e.target.value || null })
              }
              placeholder="Catatan (opsional)"
              className={`${inputClass} sm:col-span-6`}
            />

            <div className="sm:col-span-6">
              <CategoryPicker
                options={kategoriList}
                value={item.kategori_id ?? ""}
                onChange={(id) => updateItem(index, { kategori_id: id })}
                placeholder="Kategori..."
              />
            </div>
            <div className="sm:col-span-6">
              <PrioritySlider
                options={prioritasList}
                value={item.prioritas_id ?? ""}
                onChange={(id) => updateItem(index, { prioritas_id: id })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, emptyItem()])}
        className="rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-violet-500 hover:text-violet-300"
      >
        + Tambah kegiatan
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="w-full rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "+ Buat grup preset"}
      </button>
    </div>
  );
}
