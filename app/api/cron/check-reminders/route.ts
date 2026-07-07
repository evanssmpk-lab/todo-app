import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/webpush";

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
  const now = new Date();
  const windowEnd = new Date(now.getTime() + LEAD_MINUTES * 60_000);
  const todayISO = now.toISOString().slice(0, 10);

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

  return NextResponse.json({ checked: todos?.length ?? 0, due: due.length, sent });
}
