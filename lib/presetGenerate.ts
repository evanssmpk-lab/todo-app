import type { SupabaseClient } from "@supabase/supabase-js";

type PresetSource = {
  id: string;
  aktivitas: string;
  jam: string | null;
  catatan: string | null;
  kategori_id: string | null;
  prioritas_id: string | null;
};

// Dipakai baik oleh cron (generate otomatis semua user tiap ganti hari)
// maupun tombol "Terapkan ke hari ini" (manual, satu preset). Idempotent
// lewat unique index (preset_id, tanggal) di tabel todos.
export async function generateTodoFromPreset(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  preset: PresetSource,
  tanggal: string
) {
  const { data: existing } = await supabase
    .from("todos")
    .select("id")
    .eq("preset_id", preset.id)
    .eq("tanggal", tanggal)
    .maybeSingle();

  if (existing) return { created: false, todoId: existing.id as string };

  const { data: todo, error } = await supabase
    .from("todos")
    .insert({
      user_id: userId,
      aktivitas: preset.aktivitas,
      tanggal,
      jam: preset.jam,
      catatan: preset.catatan,
      kategori_id: preset.kategori_id,
      prioritas_id: preset.prioritas_id,
      dibuat_via: "preset",
      preset_id: preset.id,
    })
    .select("id")
    .single();

  if (error) {
    // Race dengan run cron lain / klik dobel: unique index bentrok, anggap
    // saja sudah ke-generate, bukan error fatal.
    if (error.code === "23505") return { created: false, todoId: null };
    throw new Error(error.message);
  }

  return { created: true, todoId: todo.id as string };
}
