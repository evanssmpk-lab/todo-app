import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTodoText } from "@/lib/gemini";
import { resolveTanggalJam } from "@/lib/todoDate";
import type { Kategori, Prioritas } from "@/lib/types";

function matchByName<T extends { id: string; nama: string }>(
  list: T[],
  name: string | null
) {
  if (!name) return null;
  const found = list.find(
    (item) => item.nama.toLowerCase() === name.toLowerCase()
  );
  return found?.id ?? null;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-shortcut-secret");
  if (!secret || secret !== process.env.SHORTCUT_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = body?.text as string | undefined;
  const timestamp = (body?.timestamp as string | undefined) ?? new Date().toISOString();

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Field 'text' wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Endpoint ini cuma untuk pemilik app (lihat APP_OWNER_EMAIL), bukan
  // sembarang user — walau sekarang sign up sudah terbuka untuk umum (F7+),
  // Shortcut selalu harus nyasar ke akun pemilik, bukan "user pertama yang
  // ketemu" yang urutannya tidak terjamin begitu ada banyak akun.
  const ownerEmail = process.env.APP_OWNER_EMAIL;
  if (!ownerEmail) {
    return NextResponse.json(
      { error: "APP_OWNER_EMAIL belum di-set di environment variable." },
      { status: 500 }
    );
  }

  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers();
  const user = usersData?.users.find(
    (u) => u.email?.toLowerCase() === ownerEmail.toLowerCase()
  );
  if (usersError || !user) {
    return NextResponse.json(
      { error: "User pemilik app tidak ditemukan." },
      { status: 500 }
    );
  }

  const [{ data: kategoriList }, { data: prioritasList }] = await Promise.all([
    supabase.from("kategori").select("*").eq("user_id", user.id),
    supabase.from("prioritas").select("*").eq("user_id", user.id),
  ]);

  let parsed;
  try {
    parsed = await parseTodoText({
      text,
      timestamp,
      kategoriList: (kategoriList as Kategori[]) ?? [],
      prioritasList: (prioritasList as Prioritas[]) ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses teks." },
      { status: 502 }
    );
  }

  const kategori_id = matchByName(
    (kategoriList as Kategori[]) ?? [],
    parsed.kategori_saran
  );
  const prioritas_id = matchByName(
    (prioritasList as Prioritas[]) ?? [],
    parsed.prioritas_saran
  );

  // Jaga-jaga: kalau AI menghasilkan tanggal hari-ini + jam yang ternyata
  // sudah lewat dari waktu request (mis. "jam 5 pagi" diucapkan jam 9 malam
  // tanpa bilang "besok"), majukan otomatis ke besok.
  const { tanggal, jam } = resolveTanggalJam(
    parsed.tanggal,
    parsed.jam,
    new Date(timestamp)
  );

  const { data: todo, error: insertError } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      aktivitas: parsed.aktivitas,
      tanggal,
      jam,
      catatan: parsed.catatan,
      kategori_id,
      prioritas_id,
      dibuat_via: "shortcut",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, todo });
}
