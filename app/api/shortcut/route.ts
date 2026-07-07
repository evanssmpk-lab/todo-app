import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTodoText } from "@/lib/gemini";
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

  // Single-user app (lihat PRD §3): ambil satu-satunya user yang terdaftar,
  // tidak perlu resolusi multi-tenant.
  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers();
  const user = usersData?.users[0];
  if (usersError || !user) {
    return NextResponse.json(
      { error: "User tidak ditemukan." },
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

  const { data: todo, error: insertError } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      aktivitas: parsed.aktivitas,
      tanggal: parsed.tanggal,
      jam: parsed.jam,
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
