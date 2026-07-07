// Aplikasi ini tidak punya konsep timezone per-user (single user, WIB) —
// semua perbandingan "hari ini"/"sekarang" harus konsisten pakai Asia/Jakarta,
// bukan timezone server (Vercel/Postgres defaultnya UTC), supaya tidak salah
// selama ~7 jam tiap malam (00:00-07:00 WIB = tanggal "kemarin" kalau dihitung
// pakai UTC mentah).
const TIMEZONE = "Asia/Jakarta";

function jakartaParts(referenceDate: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(referenceDate);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

// Date sintetis: komponen tanggal/jamnya adalah wall-clock Jakarta, dibungkus
// lewat constructor lokal supaya perbandingan (<, >, setDate, dst) terhadap
// Date lain yang dibangun dengan cara sama (mis. dari string "YYYY-MM-DDTHH:mm:ss"
// tanpa suffix zona) tetap benar secara relatif, walau epoch absolutnya "digeser".
export function jakartaNow(referenceDate: Date = new Date()): Date {
  const p = jakartaParts(referenceDate);
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

export function jakartaTodayISO(referenceDate: Date = new Date()): string {
  const p = jakartaParts(referenceDate);
  const m = String(p.month).padStart(2, "0");
  const d = String(p.day).padStart(2, "0");
  return `${p.year}-${m}-${d}`;
}

// 0 = Minggu ... 6 = Sabtu, sama seperti Date.prototype.getDay()
export function jakartaDayOfWeek(referenceDate: Date = new Date()): number {
  return jakartaNow(referenceDate).getDay();
}
