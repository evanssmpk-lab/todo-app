-- Web Push (F8): satu user bisa punya banyak subscription (Mac, iPhone, dst),
-- masing-masing device subscribe sendiri lewat browser.
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_owner" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tandai todo yang remindernya sudah dikirim, supaya endpoint cron tidak
-- mengirim notifikasi dobel untuk todo yang sama.
alter table todos add column reminder_sent_at timestamptz;
