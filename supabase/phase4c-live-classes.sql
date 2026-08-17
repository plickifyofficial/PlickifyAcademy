-- Plickify Academy — Phase 4 hotfix
-- The earlier run of phase4-engagement.sql failed at the LIVE CLASSES section.
-- Everything before it (instructor role, wishlist, coupons, notifications) already ran.
-- Run ONLY this file now to finish Phase 4, then run phase4b-instructor-policies.sql.

create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  scheduled_at timestamptz,
  duration_minutes integer not null default 60,
  meeting_url text,
  created_at timestamptz not null default now()
);

alter table public.live_classes enable row level security;

create policy "Live classes are viewable by everyone"
  on public.live_classes for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.is_published = true
    ) or public.is_admin()
  );

create policy "Only admins can insert live classes"
  on public.live_classes for insert
  with check (public.is_admin());

create policy "Only admins can update live classes"
  on public.live_classes for update
  using (public.is_admin());

create policy "Only admins can delete live classes"
  on public.live_classes for delete
  using (public.is_admin());