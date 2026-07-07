import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { NotificationToggle } from "@/components/NotificationToggle";
import { EmailToggle } from "@/components/EmailToggle";
import { jakartaNow, jakartaTodayISO } from "@/lib/tz";
import type { Kategori, Prioritas, Todo } from "@/lib/types";

function sapaan() {
  const jam = jakartaNow().getHours();
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.rpc("mark_todos_terlewat");

  const hariIni = jakartaTodayISO();

  const [{ data: todos }, { data: kategoriList }, { data: prioritasList }] =
    await Promise.all([
      supabase
        .from("todos")
        .select("*, kategori(*), prioritas(*)")
        .is("archived_at", null)
        .or(`status.eq.belum_selesai,and(status.eq.selesai,tanggal.gte.${hariIni})`)
        .order("tanggal", { ascending: true })
        .order("jam", { ascending: true, nullsFirst: false }),
      supabase.from("kategori").select("*").order("nama"),
      supabase.from("prioritas").select("*").order("urutan"),
    ]);

  const list = (todos as Todo[] | null) ?? [];
  const aktifCount = list.filter((t) => t.status === "belum_selesai").length;
  const jumlahHariIni = list.filter(
    (t) => t.tanggal === hariIni && t.status === "belum_selesai"
  ).length;

  return (
    <div className="flex flex-1 flex-col text-zinc-50">
      <header className="border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-lg font-semibold text-transparent">
              To-Do
            </h1>
            <Link
              href="/arsip"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Arsip
            </Link>
            <Link
              href="/preset"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Preset
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <NotificationToggle />
            {user?.email && <EmailToggle email={user.email} />}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{sapaan()} 👋</h2>
          <p className="text-sm text-zinc-400">
            {aktifCount === 0
              ? "Tidak ada tugas aktif — santai dulu."
              : `${aktifCount} tugas belum selesai${jumlahHariIni ? `, ${jumlahHariIni} di antaranya hari ini` : ""}.`}
          </p>
        </div>

        <TodoForm
          kategoriList={(kategoriList as Kategori[]) ?? []}
          prioritasList={(prioritasList as Prioritas[]) ?? []}
        />

        {list.length ? (
          <TodoList
            todos={list}
            kategoriList={(kategoriList as Kategori[]) ?? []}
            prioritasList={(prioritasList as Prioritas[]) ?? []}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
            <span className="text-4xl">✨</span>
            <p>Belum ada tugas. Tambahkan lewat form di atas.</p>
          </div>
        )}
      </main>
    </div>
  );
}
