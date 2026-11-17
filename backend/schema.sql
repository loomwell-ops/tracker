-- Run once in Supabase: SQL Editor > New query > Run
create table public.trackers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.trackers enable row level security;
create policy "own row only" on public.trackers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
