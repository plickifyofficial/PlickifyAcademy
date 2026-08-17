-- Plickify Academy — Phase 4: Wishlist + Coupons + Notifications + Instructor + Live Classes
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query) and press RUN.

-- ============================================================
-- 1. INSTRUCTOR ROLE (extend profiles check)
-- ============================================================
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'instructor', 'admin'));

-- ============================================================
-- 2. WISHLIST
-- ============================================================
create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.wishlist enable row level security;

create policy "Users can view own wishlist"
  on public.wishlist for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. COUPONS
-- ============================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'flat')),
  value numeric(10, 2) not null default 0,
  course_id uuid references public.courses (id) on delete cascade,
  max_uses integer not null default 0,
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "Only admins can view coupons"
  on public.coupons for select
  using (public.is_admin());

create policy "Only admins can insert coupons"
  on public.coupons for insert
  with check (public.is_admin());

create policy "Only admins can update coupons"
  on public.coupons for update
  using (public.is_admin());

create policy "Only admins can delete coupons"
  on public.coupons for delete
  using (public.is_admin());

create or replace function public.increment_coupon_used(coupon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons
  set used_count = used_count + 1
  where id = coupon_id;
$$;

grant execute on function public.increment_coupon_used(uuid) to anon, authenticated;

-- ============================================================
-- 4. NOTIFICATIONS (in-app)
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. LIVE CLASSES
-- ============================================================create table if not exists public.live_classes (
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