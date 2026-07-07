export type TodoStatus = "belum_selesai" | "selesai" | "terlewat";
export type TodoSumber = "shortcut" | "web" | "preset";

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
  archived_at: string | null;
  preset_id: string | null;
  created_at: string;
  updated_at: string;
  kategori: Kategori | null;
  prioritas: Prioritas | null;
};

export type Preset = {
  id: string;
  aktivitas: string;
  jam: string | null;
  catatan: string | null;
  kategori_id: string | null;
  prioritas_id: string | null;
  hari: number[];
  group_id: string | null;
  created_at: string;
  kategori: Kategori | null;
  prioritas: Prioritas | null;
};

export type PresetGroup = {
  id: string;
  nama: string;
  hari: number[];
  created_at: string;
};

export type PresetItemInput = {
  aktivitas: string;
  jam: string | null;
  catatan: string | null;
  kategori_id: string | null;
  prioritas_id: string | null;
};
