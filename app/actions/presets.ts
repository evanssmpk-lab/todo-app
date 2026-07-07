"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateTodoFromPreset } from "@/lib/presetGenerate";
import { jakartaTodayISO } from "@/lib/tz";
import type { PresetItemInput } from "@/lib/types";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak ada sesi login.");
  return { supabase, userId: user.id };
}

export async function createPreset(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  const aktivitas = formData.get("aktivitas") as string;
  const jam = (formData.get("jam") as string) || null;
  const catatan = (formData.get("catatan") as string) || null;
  const kategori_id = (formData.get("kategori_id") as string) || null;
  const prioritas_id = (formData.get("prioritas_id") as string) || null;
  const hari = formData.getAll("hari").map((v) => Number(v));

  if (hari.length === 0) {
    throw new Error("Pilih minimal 1 hari.");
  }

  const { error } = await supabase.from("presets").insert({
    user_id: userId,
    aktivitas,
    jam,
    catatan,
    kategori_id,
    prioritas_id,
    hari,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/preset");
}

export async function deletePreset(id: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("presets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/preset");
}

export async function applyPresetToday(id: string) {
  const { supabase, userId } = await currentUserId();
  const { data: preset, error } = await supabase
    .from("presets")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !preset) throw new Error("Preset tidak ditemukan.");

  await generateTodoFromPreset(supabase, userId, preset, jakartaTodayISO());
  revalidatePath("/");
  revalidatePath("/preset");
}

export async function createPresetGroup(input: {
  nama: string;
  hari: number[];
  items: PresetItemInput[];
}) {
  const { supabase, userId } = await currentUserId();

  if (input.hari.length === 0) throw new Error("Pilih minimal 1 hari.");
  if (input.items.length === 0) throw new Error("Tambah minimal 1 kegiatan.");
  if (input.items.some((it) => !it.aktivitas.trim())) {
    throw new Error("Semua kegiatan wajib diisi nama aktivitasnya.");
  }

  const { data: group, error: groupError } = await supabase
    .from("preset_groups")
    .insert({ user_id: userId, nama: input.nama, hari: input.hari })
    .select("id")
    .single();
  if (groupError) throw new Error(groupError.message);

  const { error: itemsError } = await supabase.from("presets").insert(
    input.items.map((it) => ({
      user_id: userId,
      group_id: group.id,
      aktivitas: it.aktivitas,
      jam: it.jam,
      catatan: it.catatan,
      kategori_id: it.kategori_id,
      prioritas_id: it.prioritas_id,
      hari: [],
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/preset");
}

export async function deletePresetGroup(id: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("preset_groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/preset");
}

export async function applyPresetGroupToday(groupId: string) {
  const { supabase, userId } = await currentUserId();
  const { data: items, error } = await supabase
    .from("presets")
    .select("*")
    .eq("group_id", groupId);
  if (error) throw new Error(error.message);

  const today = jakartaTodayISO();
  for (const item of items ?? []) {
    await generateTodoFromPreset(supabase, userId, item, today);
  }
  revalidatePath("/");
  revalidatePath("/preset");
}
