"use client";

import { useState, useTransition } from "react";
import { createKategoriFull } from "@/app/actions/kategori";
import { ColorSwatchPicker } from "@/components/ColorSwatchPicker";
import { KATEGORI_WARNA_PALETTE } from "@/lib/colorPalette";

export function KategoriCreateForm() {
  const [nama, setNama] = useState("");
  // Default tetap (bukan acak) supaya render server & client sama persis —
  // Math.random() di initial state bikin hydration mismatch.
  const [warna, setWarna] = useState(KATEGORI_WARNA_PALETTE[0]);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!nama.trim()) return;
    startTransition(async () => {
      await createKategoriFull(nama, warna);
      setNama("");
    });
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm transition-shadow focus-within:border-violet-800/60">
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Nama kategori baru..."
        className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
      />
      <ColorSwatchPicker value={warna} onChange={setWarna} />
      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="w-full rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "+ Tambah kategori"}
      </button>
    </div>
  );
}
