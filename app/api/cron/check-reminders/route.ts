import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/webpush";
import { generateTodoFromPreset } from "@/lib/presetGenerate";
import { jakartaDayOfWeek, jakartaNow, jakartaTodayISO } from "@/lib/tz";

const LEAD_MINUTES = 30;

export async function GET(request: NextRequest) {
  // Dua cara auth didukung: header Authorization (gaya Vercel Cron) atau
  // query param ?secret= (lebih gampang dikonfigurasi di layanan cron
  // eksternal seperti cron-job.org yang cuma butuh tempel URL).
  const authHeader = request.headers.get("authorization");
  const secretParam = request.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  const authorized =
    authHeader === `Bearer ${expected}` || (!!secretParam && secretParam === expected);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = jakartaNow();
  const windowEnd = new Date(now.getTime() + LEAD_MINUTES * 60_000);
  const todayISO = jakartaTodayISO();

  // ===== 1. Generate todo hari ini dari preset (individu & grup) yang jadwalnya cocok =====
  const todayDow = jakartaDayOfWeek();

  const { data: presets, error: presetError } = await supabase
    .from("presets")
    .select("*")
    .contains("hari", [todayDow]);

  let presetGenerated = 0;
  if (!presetError && presets) {
    for (const preset of presets) {
      const { created } = await generateTodoFromPreset(
        supabase,
        preset.user_id,
        preset,
        todayISO
      );
      if (created) presetGenerated++;
    }
  }

  const { data: groups, error: groupError } = await supabase
    .from("preset_groups")
    .select("*")
    .contains("hari", [todayDow]);

  if (!groupError && groups) {
    for (const group of groups) {
      const { data: items } = await supabase
        .from("presets")
        .select("*")
        .eq("group_id", group.id);
      for (const item of items ?? []) {
        const { created } = await generateTodoFromPreset(
          supabase,
          group.user_id,
          item,
          todayISO
        );
        if (created) presetGenerated++;
      }
    }
  }

  // ===== 2. Cek reminder yang waktunya mendekat =====
  const { data: todos, error } = await supabase
    .from("todos")
    .select("*")
    .eq("status", "belum_selesai")
    .not("jam", "is", null)
    .is("reminder_sent_at", null)
    .gte("tanggal", todayISO);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = (todos ?? []).filter((todo) => {
    const [h, m] = todo.jam!.slice(0, 5).split(":").map(Number);
    const target = new Date(`${todo.tanggal}T00:00:00`);
    target.setHours(h, m, 0, 0);
    return target >= now && target <= windowEnd;
  });

  let sent = 0;
  for (const todo of due) {
    const ok = await sendPushToUser(todo.user_id, {
      title: "Pengingat tugas",
      body: `${todo.aktivitas} — jam ${todo.jam!.slice(0, 5)}`,
      url: "/",
    });
    if (ok) {
      await supabase
        .from("todos")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", todo.id);
      sent++;
    }
  }

  return NextResponse.json({
    presetGenerated,
    checked: todos?.length ?? 0,
    due: due.length,
    sent,
  });
}
