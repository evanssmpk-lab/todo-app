-- Arsip manual: kalau diisi, todo dianggap "dipaksa masuk arsip" lewat menu
-- titik-tiga, terlepas dari status aslinya (belum_selesai/selesai/terlewat).
alter table todos add column archived_at timestamptz;

-- Tambah sumber "preset" supaya todo hasil auto-generate dari jadwal
-- berulang bisa dibedakan dari input web/shortcut biasa.
alter type todo_sumber add value 'preset';

-- ========== Preset (jadwal berulang) ==========
create table presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  aktivitas text not null,
  jam time,
  catatan text,
  kategori_id uuid references kategori(id) on delete set null,
  prioritas_id uuid references prioritas(id) on delete set null,
  -- 0=Minggu .. 6=Sabtu, sama seperti Date.prototype.getDay() di JS
  hari integer[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table presets enable row level security;

create policy "presets_owner" on presets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Link ke preset yang men-generate todo ini, dipakai buat idempotency (jangan
-- generate dobel todo yang sama di hari yang sama).
alter table todos add column preset_id uuid references presets(id) on delete set null;
create unique index todos_preset_tanggal_unique on todos (preset_id, tanggal)
  where preset_id is not null;

-- ========== Perbaikan timezone untuk auto-arsip ==========
-- Sebelumnya pakai current_date/current_time (ikut timezone session Postgres,
-- default UTC di Supabase) — diganti eksplisit ke Asia/Jakarta supaya "hari
-- ini" konsisten dengan yang dilihat user di web.
create or replace function mark_todos_terlewat()
returns void as $$
begin
  update todos
  set status = 'terlewat'
  where status = 'belum_selesai'
    and (
      tanggal < (now() at time zone 'Asia/Jakarta')::date
      or (
        tanggal = (now() at time zone 'Asia/Jakarta')::date
        and jam is not null
        and jam < (now() at time zone 'Asia/Jakarta')::time
      )
    );
end;
$$ language plpgsql security definer;
