"use client";

import { useTransition } from "react";
import { deleteKategori, updateKategoriWarna } from "@/app/actions/kategori";
import { Popover } from "@/components/ui/Popover";
import { ColorSwatchPicker } from "@/components/ColorSwatchPicker";
import type { Kategori } from "@/lib/types";

export function KategoriManagerItem({ kategori }: { kategori: Kategori }) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition-opacity ${
        pending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ background: kategori.warna ?? "#71717a" }}
        />
        <span className="text-sm text-zinc-100">{kategori.nama}</span>
      </div>
      <div className="flex items-center gap-3">
        <Popover
          align="right"
          trigger={() => (
            <span className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800">
              Ganti warna
            </span>
          )}
        >
          {(close) => (
            <div className="w-56 rounded-xl border border-zinc-700 bg-zinc-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-sm">
              <ColorSwatchPicker
                value={kategori.warna ?? ""}
                onChange={(hex) => {
                  close();
                  startTransition(() => updateKategoriWarna(kategori.id, hex));
                }}
              />
            </div>
          )}
        </Popover>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteKategori(kategori.id))}
          className="text-xs text-zinc-500 transition-colors hover:text-red-400"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
