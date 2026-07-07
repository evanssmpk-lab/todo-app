export const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const HARI_PENDEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const HARI_PANJANG = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

// Ringkasan hari terpilih jadi teks: "Selasa" / "Selasa dan Rabu" /
// "Selasa, Rabu, dan Kamis" / "hari kerja" (Senin-Sabtu) / "tiap hari" (semua).
export function describeHari(hari: number[]): string {
  if (hari.length === 0) return "";
  const sorted = [...new Set(hari)].sort((a, b) => a - b);

  if (sorted.length === 7) return "tiap hari";

  const isHariKerja =
    sorted.length === 6 && [1, 2, 3, 4, 5, 6].every((d, i) => sorted[i] === d);
  if (isHariKerja) return "hari kerja";

  const names = sorted.map((d) => HARI_PANJANG[d]);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} dan ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, dan ${names[names.length - 1]}`;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function buildMonthGrid(year: number, month: number) {
  const total = daysInMonth(year, month);
  const offset = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function toISODate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function parseISODate(value: string) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}
