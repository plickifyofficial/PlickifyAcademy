-- Plickify Academy — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image text,
  price numeric(10, 2) not null default 0,
  level text default 'beginner', -- beginner | intermediate | advanced
  is_published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

-- ============================================================
-- LESSONS
-- ============================================================
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  video_url text,
  content text,
  duration_minutes integer default 0,
  is_free boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

alter table public.lessons enable row level security;

-- ============================================================
-- ENROLLMENTS
-- ============================================================
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default true,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

-- ============================================================
-- ORDERS (Stripe)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  stripe_session_id text unique,
  amount numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- courses (public read for published)
create policy "Published courses are viewable by everyone"
  on public.courses for select
  using (is_published = true or public.is_admin());

create policy "Only admins can insert courses"
  on public.courses for insert
  with check (public.is_admin());

create policy "Only admins can update courses"
  on public.courses for update
  using (public.is_admin());

create policy "Only admins can delete courses"
  on public.courses for delete
  using (public.is_admin());

-- lessons (public read for free/published courses)
create policy "Lessons are viewable by everyone"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.is_published = true
    ) or public.is_admin()
  );

create policy "Only admins can insert lessons"
  on public.lessons for insert
  with check (public.is_admin());

create policy "Only admins can update lessons"
  on public.lessons for update
  using (public.is_admin());

create policy "Only admins can delete lessons"
  on public.lessons for delete
  using (public.is_admin());

-- enrollments
create policy "Users can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can enroll themselves"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

create policy "Users can unenroll themselves"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- lesson_progress
create policy "Users can view own progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- HELPER: enroll user into course (used after payment)
-- ============================================================
create or replace function public.enroll_course(p_course_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.enrollments (user_id, course_id)
  values (auth.uid(), p_course_id)
  on conflict (user_id, course_id) do nothing;
end;
$$;
