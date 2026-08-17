-- Plickify Academy — Phase 4 + 5 COMPLETE SETUP (wishlist, coupons, notifications, live classes, instructor role, FKs)
-- Fully idempotent: safe to run multiple times. Run this ONE file, then everything works.

-- ============================================================
-- 0. INSTRUCTOR ROLE (extend profiles check)
-- ============================================================
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'instructor', 'admin'));

-- ============================================================
-- 0b. Ensure courses.created_by exists (needed by instructors)
-- ============================================================
alter table public.courses
  add column if not exists created_by uuid references auth.users (id) on delete set null;

-- ============================================================
-- 1. WISHLIST
-- ============================================================
create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.wishlist enable row level security;

drop policy if exists "Users can view own wishlist" on public.wishlist;
create policy "Users can view own wishlist"
  on public.wishlist for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own wishlist" on public.wishlist;
create policy "Users can insert own wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlist" on public.wishlist;
create policy "Users can delete own wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 2. COUPONS
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

drop policy if exists "Only admins can view coupons" on public.coupons;
create policy "Only admins can view coupons"
  on public.coupons for select
  using (public.is_admin());

drop policy if exists "Only admins can insert coupons" on public.coupons;
create policy "Only admins can insert coupons"
  on public.coupons for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update coupons" on public.coupons;
create policy "Only admins can update coupons"
  on public.coupons for update
  using (public.is_admin());

drop policy if exists "Only admins can delete coupons" on public.coupons;
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
-- 3. NOTIFICATIONS
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

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. LIVE CLASSES
-- ============================================================
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

drop policy if exists "Live classes are viewable by everyone" on public.live_classes;
create policy "Live classes are viewable by everyone"
  on public.live_classes for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.is_published = true
    ) or public.is_admin()
  );

-- ============================================================
-- 5. INSTRUCTOR WRITE POLICIES (course owners can edit their own content)
-- ============================================================
drop policy if exists "Only admins can insert courses" on public.courses;
drop policy if exists "Only admins can update courses" on public.courses;
drop policy if exists "Only admins can delete courses" on public.courses;

drop policy if exists "Admins and course owners can insert courses" on public.courses;
drop policy if exists "Admins and course owners can update courses" on public.courses;
drop policy if exists "Admins and course owners can delete courses" on public.courses;

create policy "Admins and course owners can insert courses"
  on public.courses for insert
  with check (public.is_admin() or auth.uid() = created_by);

create policy "Admins and course owners can update courses"
  on public.courses for update
  using (public.is_admin() or auth.uid() = created_by)
  with check (public.is_admin() or auth.uid() = created_by);

create policy "Admins and course owners can delete courses"
  on public.courses for delete
  using (public.is_admin() or auth.uid() = created_by);

-- LESSONS
drop policy if exists "Only admins can insert lessons" on public.lessons;
drop policy if exists "Only admins can update lessons" on public.lessons;
drop policy if exists "Only admins can delete lessons" on public.lessons;
drop policy if exists "Course editors can insert lessons" on public.lessons;
drop policy if exists "Course editors can update lessons" on public.lessons;
drop policy if exists "Course editors can delete lessons" on public.lessons;

create policy "Course editors can insert lessons"
  on public.lessons for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can update lessons"
  on public.lessons for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can delete lessons"
  on public.lessons for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.created_by = auth.uid()
    )
  );

-- COURSE SECTIONS
drop policy if exists "Only admins can insert sections" on public.course_sections;
drop policy if exists "Only admins can update sections" on public.course_sections;
drop policy if exists "Only admins can delete sections" on public.course_sections;
drop policy if exists "Course editors can insert sections" on public.course_sections;
drop policy if exists "Course editors can update sections" on public.course_sections;
drop policy if exists "Course editors can delete sections" on public.course_sections;

create policy "Course editors can insert sections"
  on public.course_sections for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can update sections"
  on public.course_sections for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can delete sections"
  on public.course_sections for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.created_by = auth.uid()
    )
  );

-- QUIZ QUESTIONS
drop policy if exists "Only admins can insert quiz questions" on public.quiz_questions;
drop policy if exists "Only admins can update quiz questions" on public.quiz_questions;
drop policy if exists "Only admins can delete quiz questions" on public.quiz_questions;
drop policy if exists "Course editors can insert quiz questions" on public.quiz_questions;
drop policy if exists "Course editors can update quiz questions" on public.quiz_questions;
drop policy if exists "Course editors can delete quiz questions" on public.quiz_questions;

create policy "Course editors can insert quiz questions"
  on public.quiz_questions for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can update quiz questions"
  on public.quiz_questions for update
  using (
    public.is_admin() or exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can delete quiz questions"
  on public.quiz_questions for delete
  using (
    public.is_admin() or exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.created_by = auth.uid()
    )
  );

-- ANNOUNCEMENTS
drop policy if exists "Only admins can insert announcements" on public.course_announcements;
drop policy if exists "Only admins can update announcements" on public.course_announcements;
drop policy if exists "Only admins can delete announcements" on public.course_announcements;
drop policy if exists "Course editors can insert announcements" on public.course_announcements;
drop policy if exists "Course editors can update announcements" on public.course_announcements;
drop policy if exists "Course editors can delete announcements" on public.course_announcements;

create policy "Course editors can insert announcements"
  on public.course_announcements for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can update announcements"
  on public.course_announcements for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can delete announcements"
  on public.course_announcements for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.created_by = auth.uid()
    )
  );

-- LIVE CLASSES (editor insert/update/delete)
drop policy if exists "Only admins can insert live classes" on public.live_classes;
drop policy if exists "Only admins can update live classes" on public.live_classes;
drop policy if exists "Only admins can delete live classes" on public.live_classes;
drop policy if exists "Course editors can insert live classes" on public.live_classes;
drop policy if exists "Course editors can update live classes" on public.live_classes;
drop policy if exists "Course editors can delete live classes" on public.live_classes;

create policy "Course editors can insert live classes"
  on public.live_classes for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can update live classes"
  on public.live_classes for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.created_by = auth.uid()
    )
  );

create policy "Course editors can delete live classes"
  on public.live_classes for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.created_by = auth.uid()
    )
  );

-- ============================================================
-- 6. FKs: user_id -> public.profiles (fixes admin emails, review/Q&A/certificate names)
-- ============================================================
alter table public.enrollments
  drop constraint if exists enrollments_user_id_profiles_fkey;
alter table public.enrollments
  add constraint enrollments_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.lesson_progress
  drop constraint if exists lesson_progress_user_id_profiles_fkey;
alter table public.lesson_progress
  add constraint lesson_progress_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.reviews
  drop constraint if exists reviews_user_id_profiles_fkey;
alter table public.reviews
  add constraint reviews_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.course_qna
  drop constraint if exists course_qna_user_id_profiles_fkey;
alter table public.course_qna
  add constraint course_qna_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.certificates
  drop constraint if exists certificates_user_id_profiles_fkey;
alter table public.certificates
  add constraint certificates_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.quiz_attempts
  drop constraint if exists quiz_attempts_user_id_profiles_fkey;
alter table public.quiz_attempts
  add constraint quiz_attempts_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.user_course_state
  drop constraint if exists user_course_state_user_id_profiles_fkey;
alter table public.user_course_state
  add constraint user_course_state_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.wishlist
  drop constraint if exists wishlist_user_id_profiles_fkey;
alter table public.wishlist
  add constraint wishlist_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.notifications
  drop constraint if exists notifications_user_id_profiles_fkey;
alter table public.notifications
  add constraint notifications_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.orders
  drop constraint if exists orders_user_id_profiles_fkey;
alter table public.orders
  add constraint orders_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;