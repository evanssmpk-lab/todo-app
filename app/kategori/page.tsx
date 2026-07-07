import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KategoriCreateForm } from "@/components/KategoriCreateForm";
import { KategoriManagerItem } from "@/components/KategoriManagerItem";
import type { Kategori } from "@/lib/types";

export default async function KategoriPage() {
  const supabase = await createClient();
  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("*")
    .order("nama");

  const list = (kategoriList as Kategori[] | null) ?? [];

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
            Kelola Kategori
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="mb-6 text-sm text-zinc-400">
          Tambah, ganti warna, atau hapus kategori. Todo yang masih pakai
          kategori yang dihapus tidak ikut terhapus — cuma kehilangan tag
          kategorinya.
        </p>

        <KategoriCreateForm />

        <div className="flex flex-col gap-2">
          {list.length ? (
            list.map((k) => <KategoriManagerItem key={k.id} kategori={k} />)
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
              <span className="text-4xl">🎨</span>
              <p>Belum ada kategori.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
