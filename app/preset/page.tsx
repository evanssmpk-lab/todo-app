import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PresetForm } from "@/components/PresetForm";
import { PresetItem } from "@/components/PresetItem";
import type { Kategori, Prioritas, Preset } from "@/lib/types";

export default async function PresetPage() {
  const supabase = await createClient();

  const [{ data: presets }, { data: kategoriList }, { data: prioritasList }] =
    await Promise.all([
      supabase
        .from("presets")
        .select("*, kategori(*), prioritas(*)")
        .order("created_at", { ascending: false }),
      supabase.from("kategori").select("*").order("nama"),
      supabase.from("prioritas").select("*").order("urutan"),
    ]);

  const list = (presets as Preset[] | null) ?? [];

  return (
    <div className="flex flex-1 flex-col text-zinc-50">
      <header className="border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← To-Do
          </Link>
          <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-lg font-semibold text-transparent">
            Preset Jadwal
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="mb-6 text-sm text-zinc-400">
          Bikin jadwal rutin — tugas ini otomatis muncul sendiri di hari yang
          dipilih, tanpa perlu diketik ulang tiap hari.
        </p>

        <PresetForm
          kategoriList={(kategoriList as Kategori[]) ?? []}
          prioritasList={(prioritasList as Prioritas[]) ?? []}
        />

        <div className="flex flex-col gap-3">
          {list.length ? (
            list.map((preset) => (
              <PresetItem key={preset.id} preset={preset} />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
              <span className="text-4xl">🔁</span>
              <p>Belum ada preset. Buat lewat form di atas.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
