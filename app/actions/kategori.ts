"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak ada sesi login.");
  return { supabase, userId: user.id };
}

function revalidateAllPagesUsingKategori() {
  revalidatePath("/kategori");
  revalidatePath("/");
  revalidatePath("/arsip");
  revalidatePath("/preset");
}

export async function createKategoriFull(nama: string, warna: string) {
  const { supabase, userId } = await currentUserId();
  const { error } = await supabase
    .from("kategori")
    .insert({ user_id: userId, nama, warna });
  if (error) throw new Error(error.message);
  revalidateAllPagesUsingKategori();
}

export async function updateKategoriWarna(id: string, warna: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase
    .from("kategori")
    .update({ warna })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAllPagesUsingKategori();
}

export async function deleteKategori(id: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("kategori").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAllPagesUsingKategori();
}
