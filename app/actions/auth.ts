"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function siteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}

export async function login(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/");
}

export async function signup(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }
  if (password !== confirm) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Kalau project Supabase mewajibkan verifikasi email, belum ada sesi aktif
  // sampai user klik link konfirmasi yang dikirim ke emailnya.
  if (!data.session) {
    return {
      message: "Akun dibuat. Cek email kamu untuk verifikasi sebelum login.",
    };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: unknown,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const origin = await siteOrigin();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  // Pesan sukses selalu sama walau email tidak terdaftar, supaya orang
  // tidak bisa menebak email mana saja yang punya akun (user enumeration).
  return {
    message: "Kalau email itu terdaftar, link reset sudah dikirim. Cek inbox/spam.",
  };
}

export async function updatePassword(
  _prevState: unknown,
  formData: FormData
) {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }
  if (password !== confirm) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
