export type TodoStatus = "belum_selesai" | "selesai" | "terlewat";
export type TodoSumber = "shortcut" | "web";

export type Kategori = {
  id: string;
  nama: string;
  warna: string | null;
};

export type Prioritas = {
  id: string;
  nama: string;
  urutan: number;
};

export type Todo = {
  id: string;
  aktivitas: string;
  tanggal: string;
  jam: string | null;
  catatan: string | null;
  kategori_id: string | null;
  prioritas_id: string | null;
  status: TodoStatus;
  dibuat_via: TodoSumber;
  created_at: string;
  updated_at: string;
  kategori: Kategori | null;
  prioritas: Prioritas | null;
};
