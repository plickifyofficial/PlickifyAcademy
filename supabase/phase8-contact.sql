-- Phase 8: Floating Contact System — analytics events
-- Settings are stored in site_content key 'contact.settings' (existing table).
-- Offline chat messages reuse the existing contact_messages table.

create table if not exists public.contact_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  label text,
  path text,
  created_at timestamptz not null default now()
);

alter table public.contact_events enable row level security;

create index if not exists contact_events_type_idx on public.contact_events (event_type);
create index if not exists contact_events_created_idx on public.contact_events (created_at desc);

drop policy if exists "Anyone can insert contact events" on public.contact_events;
create policy "Anyone can insert contact events"
  on public.contact_events for insert
  with check (true);

drop policy if exists "Only admins can view contact events" on public.contact_events;
create policy "Only admins can view contact events"
  on public.contact_events for select
  using (public.is_admin());