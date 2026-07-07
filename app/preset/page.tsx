import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PresetCreateSection } from "@/components/PresetCreateSection";
import { PresetItem } from "@/components/PresetItem";
import { PresetGroupItem } from "@/components/PresetGroupItem";
import type { Kategori, Prioritas, Preset, PresetGroup } from "@/lib/types";

export default async function PresetPage() {
  const supabase = await createClient();

  const [
    { data: allPresets },
    { data: groups },
    { data: kategoriList },
    { data: prioritasList },
  ] = await Promise.all([
    supabase
      .from("presets")
      .select("*, kategori(*), prioritas(*)")
      .order("created_at", { ascending: false }),
    supabase
      .from("preset_groups")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("kategori").select("*").order("nama"),
    supabase.from("prioritas").select("*").order("urutan"),
  ]);

  const presets = (allPresets as Preset[] | null) ?? [];
  const presetList = presets.filter((p) => !p.group_id);
  const groupList = (groups as PresetGroup[] | null) ?? [];

  const entries = [
    ...presetList.map((p) => ({
      type: "preset" as const,
      createdAt: p.created_at,
      preset: p,
    })),
    ...groupList.map((g) => ({
      type: "group" as const,
      createdAt: g.created_at,
      group: g,
      items: presets.filter((p) => p.group_id === g.id),
    })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

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
          dipilih, tanpa perlu diketik ulang tiap hari. Pilih &quot;Satu
          kegiatan&quot; untuk satu rutinitas, atau &quot;Grup&quot; kalau satu
          hari punya beberapa kegiatan sekaligus.
        </p>

        <PresetCreateSection
          kategoriList={(kategoriList as Kategori[]) ?? []}
          prioritasList={(prioritasList as Prioritas[]) ?? []}
        />

        <div className="flex flex-col gap-3">
          {entries.length ? (
            entries.map((entry) =>
              entry.type === "preset" ? (
                <PresetItem key={entry.preset.id} preset={entry.preset} />
              ) : (
                <PresetGroupItem
                  key={entry.group.id}
                  group={entry.group}
                  items={entry.items}
                />
              )
            )
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
