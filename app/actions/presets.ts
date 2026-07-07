"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateTodoFromPreset } from "@/lib/presetGenerate";
import { jakartaTodayISO } from "@/lib/tz";

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
