-- ============================================================
-- PHASE 6E — Profile completion, user preferences/settings
-- ============================================================

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists location text;

alter table public.profiles
  add column if not exists bio text;

create table if not exists public.user_preferences (
  id uuid primary key references auth.users (id) on delete cascade,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  marketing_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_owner_all" on public.user_preferences;
create policy "user_preferences_owner_all" on public.user_preferences
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());