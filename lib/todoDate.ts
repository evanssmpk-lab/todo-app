import { jakartaNow, jakartaTodayISO } from "@/lib/tz";

// Kalau user (atau AI) input tanggal = hari ini tapi jam-nya sudah kelewat
// dari waktu sekarang, itu artinya waktunya sudah tidak mungkin lagi hari
// ini — majukan otomatis ke besok. Tanggal SELAIN hari ini (misal sengaja
// backfill kejadian yang sudah lewat) tidak disentuh sama sekali.
export function resolveTanggalJam(
  tanggal: string,
  jam: string | null,
  referenceDate: Date = new Date()
): { tanggal: string; jam: string | null } {
  if (!jam) return { tanggal, jam };

  const todayISO = jakartaTodayISO(referenceDate);
  if (tanggal !== todayISO) return { tanggal, jam };

  const now = jakartaNow(referenceDate);
  const [h, m] = jam.slice(0, 5).split(":").map(Number);
  const target = new Date(`${tanggal}T00:00:00`);
  target.setHours(h, m, 0, 0);

  if (target >= now) return { tanggal, jam };

  const next = new Date(target);
  next.setDate(next.getDate() + 1);
  const y = next.getFullYear();
  const mo = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return { tanggal: `${y}-${mo}-${d}`, jam };
}
