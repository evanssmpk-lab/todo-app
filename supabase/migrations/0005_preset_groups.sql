-- Preset grup: satu grup (misal "Rutinitas Rabu") berisi banyak kegiatan
-- (masing-masing baris di tabel presets) yang berbagi jadwal hari yang sama.
create table preset_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  hari integer[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table preset_groups enable row level security;

create policy "preset_groups_owner" on preset_groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Preset individu (group_id null) tetap pakai kolom hari miliknya sendiri.
-- Preset yang jadi anggota grup (group_id terisi) ambil jadwal hari dari
-- grupnya, bukan dari kolom hari-nya sendiri (dibiarkan kosong '{}').
alter table presets add column group_id uuid references preset_groups(id) on delete cascade;
