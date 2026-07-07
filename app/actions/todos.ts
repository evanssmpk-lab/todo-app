"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TodoStatus } from "@/lib/types";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak ada sesi login.");
  return { supabase, userId: user.id };
}

export async function createTodo(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  const aktivitas = formData.get("aktivitas") as string;
  const tanggal = formData.get("tanggal") as string;
  const jam = (formData.get("jam") as string) || null;
  const catatan = (formData.get("catatan") as string) || null;
  const kategori_id = (formData.get("kategori_id") as string) || null;
  const prioritas_id = (formData.get("prioritas_id") as string) || null;

  const { error } = await supabase.from("todos").insert({
    user_id: userId,
    aktivitas,
    tanggal,
    jam,
    catatan,
    kategori_id,
    prioritas_id,
    dibuat_via: "web",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateTodoField(
  id: string,
  fields: Partial<{
    kategori_id: string | null;
    prioritas_id: string | null;
    status: TodoStatus;
  }>
) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("todos").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/arsip");
}

export async function deleteTodo(id: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/arsip");
}

export async function createKategori(nama: string) {
  const { supabase, userId } = await currentUserId();
  const { data, error } = await supabase
    .from("kategori")
    .insert({ user_id: userId, nama })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}

export async function createPrioritas(nama: string) {
  const { supabase, userId } = await currentUserId();
  const { data: existing } = await supabase
    .from("prioritas")
    .select("urutan")
    .eq("user_id", userId)
    .order("urutan", { ascending: false })
    .limit(1)
    .maybeSingle();

  const urutan = (existing?.urutan ?? 0) + 1;

  const { data, error } = await supabase
    .from("prioritas")
    .insert({ user_id: userId, nama, urutan })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
}
