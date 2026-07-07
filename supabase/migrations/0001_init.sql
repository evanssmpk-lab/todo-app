-- Skema awal: kategori, prioritas, todos
-- Dirancang untuk single user tapi tetap pakai RLS berbasis auth.uid()
-- supaya data tetap aman kalau nanti Supabase Auth diaktifkan.

create extension if not exists pgcrypto;

create type todo_status as enum ('belum_selesai', 'selesai', 'terlewat');
create type todo_sumber as enum ('shortcut', 'web');

-- ========== Kategori ==========
create table kategori (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  warna text, -- hex color, opsional
  created_at timestamptz not null default now(),
  unique (user_id, nama)
);

-- ========== Prioritas ==========
create table prioritas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, nama)
);

-- ========== Todos ==========
create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  aktivitas text not null,
  tanggal date not null,
  jam time, -- nullable
  catatan text, -- nullable
  kategori_id uuid references kategori(id) on delete set null,
  prioritas_id uuid references prioritas(id) on delete set null,
  status todo_status not null default 'belum_selesai',
  dibuat_via todo_sumber not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index todos_user_tanggal_idx on todos (user_id, tanggal);
create index todos_user_status_idx on todos (user_id, status);

-- ========== updated_at otomatis ==========
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger todos_set_updated_at
  before update on todos
  for each row
  execute function set_updated_at();

-- ========== Row Level Security ==========
alter table kategori enable row level security;
alter table prioritas enable row level security;
alter table todos enable row level security;

create policy "kategori_owner" on kategori
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "prioritas_owner" on prioritas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "todos_owner" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========== Auto-mark todo terlewat ==========
-- Menandai todo yang tanggal+jam-nya sudah lewat dan masih belum_selesai
-- jadi terlewat. Panggil manual, via Supabase Cron/Edge Function terjadwal,
-- atau dari API route saat halaman web dibuka.
create or replace function mark_todos_terlewat()
returns void as $$
begin
  update todos
  set status = 'terlewat'
  where status = 'belum_selesai'
    and (tanggal < current_date
      or (tanggal = current_date and jam is not null and jam < current_time));
end;
$$ language plpgsql security definer;
