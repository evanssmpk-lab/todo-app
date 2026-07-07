"use client";

import { useState } from "react";
import { createKategori } from "@/app/actions/todos";
import { Popover } from "@/components/ui/Popover";
import type { Kategori } from "@/lib/types";

export function CategoryPicker({
  options,
  value,
  onChange,
  placeholder = "Kategori...",
}: {
  options: Kategori[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState(false);

  const selected = options.find((o) => o.id === value) ?? null;

  async function submitNew(close: () => void) {
    const nama = newName.trim();
    if (!nama) {
      setAdding(false);
      return;
    }
    setPending(true);
    const created = await createKategori(nama);
    setPending(false);
    setNewName("");
    setAdding(false);
    onChange(created.id);
    close();
  }

  return (
    <Popover
      trigger={({ open }) => (
        <div
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 transition-colors ${
            open
              ? "border-violet-500 ring-2 ring-violet-500/30"
              : "border-zinc-700 hover:border-zinc-600"
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: selected.warna ?? "#71717a" }}
                />
                {selected.nama}
              </>
            ) : (
              <span className="text-zinc-500">{placeholder}</span>
            )}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`size-4 shrink-0 text-zinc-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    >
      {(close) => (
        <div className="w-56 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="max-h-56 overflow-y-auto p-1">
            {options.length === 0 && (
              <p className="px-2.5 py-2 text-sm text-zinc-500">
                Belum ada kategori.
              </p>
            )}
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  close();
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                  opt.id === value ? "bg-zinc-800/80" : ""
                }`}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: opt.warna ?? "#71717a" }}
                />
                <span className="truncate text-zinc-100">{opt.nama}</span>
                {opt.id === value && (
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-auto size-4 shrink-0 text-violet-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-800 p-1">
            {adding ? (
              <input
                autoFocus
                value={newName}
                disabled={pending}
                placeholder="Nama kategori baru..."
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => submitNew(close)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitNew(close);
                  }
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewName("");
                  }
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-sm text-zinc-50 outline-none focus:border-violet-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-violet-400 transition-colors hover:bg-zinc-800"
              >
                <span className="flex size-4 items-center justify-center">
                  +
                </span>
                Tambah kategori baru
              </button>
            )}
          </div>
        </div>
      )}
    </Popover>
  );
}
