import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArsipList } from "@/components/ArsipList";
import { jakartaTodayISO } from "@/lib/tz";
import type { Kategori, Prioritas, Todo } from "@/lib/types";

export default async function ArsipPage() {
  const supabase = await createClient();
  const hariIni = jakartaTodayISO();

  const [{ data: todos }, { data: kategoriList }, { data: prioritasList }] =
    await Promise.all([
      supabase
        .from("todos")
        .select("*, kategori(*), prioritas(*)")
        .or(
          `archived_at.not.is.null,status.eq.terlewat,and(status.eq.selesai,tanggal.lt.${hariIni})`
        )
        .order("tanggal", { ascending: false }),
      supabase.from("kategori").select("*").order("nama"),
      supabase.from("prioritas").select("*").order("urutan"),
    ]);

  const list = (todos as Todo[] | null) ?? [];

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
            Arsip
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {list.length ? (
          <ArsipList
            todos={list}
            kategoriList={(kategoriList as Kategori[]) ?? []}
            prioritasList={(prioritasList as Prioritas[]) ?? []}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
            <span className="text-4xl">🗂️</span>
            <p>Belum ada tugas yang selesai atau terlewat.</p>
          </div>
        )}
      </main>
    </div>
  );
}
