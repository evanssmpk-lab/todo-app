import { GoogleGenAI } from "@google/genai";
import type { Kategori, Prioritas } from "@/lib/types";

export type ParsedTodo = {
  aktivitas: string;
  tanggal: string;
  jam: string | null;
  catatan: string | null;
  kategori_saran: string | null;
  prioritas_saran: string | null;
};

function buildPrompt(
  currentTimestamp: string,
  kategoriNames: string[],
  prioritasNames: string[],
  userInput: string
) {
  return `Kamu adalah asisten yang mengubah teks bebas berbahasa Indonesia menjadi data terstruktur JSON untuk aplikasi to-do list.

Konteks:
- Waktu saat ini: ${currentTimestamp}
- Daftar kategori yang tersedia: ${kategoriNames.join(", ") || "(belum ada)"}
- Daftar prioritas yang tersedia: ${prioritasNames.join(", ") || "(belum ada)"}

Tugas:
1. Ekstrak aktivitas, tanggal (YYYY-MM-DD), jam (HH:MM, boleh null), dan catatan dari teks.
2. Jika teks mengandung waktu relatif (nanti malam, besok, lusa), hitung tanggal/jam absolut berdasarkan waktu saat ini.
3. Coba cocokkan aktivitas dengan salah satu kategori & prioritas yang tersedia di daftar. Jika tidak yakin, kosongkan (null).
4. JANGAN membuat kategori/prioritas baru yang tidak ada di daftar.

Teks pengguna: "${userInput}"

Jawab HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan tambahan, format:
{
  "aktivitas": "",
  "tanggal": "",
  "jam": null,
  "catatan": null,
  "kategori_saran": null,
  "prioritas_saran": null
}`;
}

export async function parseTodoText({
  text,
  timestamp,
  kategoriList,
  prioritasList,
}: {
  text: string;
  timestamp: string;
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}): Promise<ParsedTodo> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = buildPrompt(
    timestamp,
    kategoriList.map((k) => k.nama),
    prioritasList.map((p) => p.nama),
    text
  );

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini tidak mengembalikan respons.");
  }

  let parsed: ParsedTodo;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Gagal parsing JSON dari Gemini: ${raw}`);
  }

  if (!parsed.aktivitas || !parsed.tanggal) {
    throw new Error("Hasil parsing tidak lengkap (aktivitas/tanggal kosong).");
  }

  return parsed;
}
