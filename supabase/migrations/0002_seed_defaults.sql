-- Auto-seed kategori & prioritas default setiap kali ada user baru daftar.
-- Supaya begitu akun dibuat, dropdown kategori/prioritas di web langsung
-- terisi tanpa perlu insert manual.
--
-- PENTING: trigger ini jalan lewat role supabase_auth_admin saat proses
-- signup, yang search_path-nya tidak mencakup skema `public`. Karena itu
-- tabel harus di-qualify penuh (public.kategori, bukan kategori saja),
-- dan search_path di-set eksplisit di definisi fungsi.
--
-- Insert dibungkus exception handler supaya kegagalan seeding tidak pernah
-- menggagalkan pembuatan user itu sendiri (signup tetap lebih prioritas
-- daripada kenyamanan seed data default).

create or replace function seed_default_kategori_prioritas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.kategori (user_id, nama, warna) values
      (new.id, 'Belanja', '#f59e0b'),
      (new.id, 'Kerja', '#3b82f6'),
      (new.id, 'Pribadi', '#a855f7');

    insert into public.prioritas (user_id, nama, urutan) values
      (new.id, 'Rendah', 1),
      (new.id, 'Sedang', 2),
      (new.id, 'Tinggi', 3),
      (new.id, 'Sangat Tinggi', 4);
  exception when others then
    raise warning 'seed_default_kategori_prioritas gagal untuk user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_defaults on auth.users;

create trigger on_auth_user_created_seed_defaults
  after insert on auth.users
  for each row
  execute function seed_default_kategori_prioritas();
