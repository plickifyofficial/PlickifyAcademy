-- ============================================================
-- Plickify Academy — COMPLETE DATABASE SETUP (run ONCE, idempotent)
-- Covers: base schema + sections + quiz/progress + social
--         (certificates/reviews/Q&A/announcements) + wishlist +
--         coupons + notifications + live classes + instructor role
--         + user->profiles FKs + manual payment (bKash/Nagad).
-- Safe to re-run: every create is guarded.
-- ============================================================

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'instructor', 'admin'));

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;
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
  level text default 'beginner',
  is_published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

alter table public.courses
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter table public.courses
  add column if not exists subtitle text,
  add column if not exists category text default 'General',
  add column if not exists language text default 'Bengali',
  add column if not exists original_price numeric(10, 2) default 0,
  add column if not exists is_featured boolean not null default false,
  add column if not exists certificate boolean not null default true,
  add column if not exists tags text[] not null default '{}',
  add column if not exists promo_video_url text,
  add column if not exists promo_video_embed text;

alter table public.courses
  add column if not exists visibility text not null default 'public'
  check (visibility in ('public', 'private'));

alter table public.courses
  add column if not exists content jsonb;

-- ============================================================
-- LESSONS (Topics)
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

alter table public.lessons
  add column if not exists section_id uuid references public.course_sections (id) on delete cascade;

alter table public.lessons
  add column if not exists type text not null default 'lesson'
  check (type in ('lesson', 'quiz', 'assignment', 'video'));

alter table public.lessons
  add column if not exists pass_percent integer not null default 60;

alter table public.lessons
  add column if not exists release_days integer not null default 0;

alter table public.lessons
  add column if not exists video_embed text;

create index if not exists lessons_section_id_idx on public.lessons (section_id);

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
-- ORDERS (manual payment: bKash/Nagad)
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

alter table public.orders
  add column if not exists payment_method text;

alter table public.orders
  add column if not exists trx_id text;

alter table public.orders
  add column if not exists coupon_id text;

create index if not exists orders_status_idx on public.orders (status);

-- ============================================================
-- COURSE SECTIONS (curriculum units)
-- ============================================================
create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_sections enable row level security;

-- default section for every course
insert into public.course_sections (course_id, title, position)
select c.id, 'Course Content', 0
from public.courses c
where not exists (select 1 from public.course_sections s where s.course_id = c.id);

-- ============================================================
-- QUIZ QUESTIONS + ATTEMPTS + USER COURSE STATE
-- ============================================================
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  question text not null,
  options jsonb not null default '[]',
  correct_index integer not null default 0,
  explanation text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score integer not null default 0,
  total integer not null default 0,
  passed boolean not null default false,
  answers jsonb,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create index if not exists quiz_attempts_user_lesson_idx
  on public.quiz_attempts (user_id, lesson_id);

create table if not exists public.user_course_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  last_lesson_id uuid references public.lessons (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.user_course_state enable row level security;

-- ============================================================
-- CERTIFICATES
-- ============================================================
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.certificates enable row level security;

create or replace function public.issue_certificate(p_course_id uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_cert_id uuid;
  v_number text;
begin
  if not exists (
    select 1 from public.lessons l
    where l.course_id = p_course_id
      and not exists (
        select 1 from public.lesson_progress lp
        where lp.lesson_id = l.id and lp.user_id = auth.uid() and lp.completed = true
      )
  ) then
    raise exception 'course not completed';
  end if;

  select id into v_cert_id
  from public.certificates
  where user_id = auth.uid() and course_id = p_course_id;

  if v_cert_id is null then
    v_number := 'PLK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
    insert into public.certificates (user_id, course_id, certificate_number)
    values (auth.uid(), p_course_id, v_number)
    returning id into v_cert_id;
  end if;

  return v_cert_id;
end;
$$;

grant execute on function public.issue_certificate(uuid) to authenticated;

-- ============================================================
-- REVIEWS + Q&A + ANNOUNCEMENTS
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

alter table public.reviews enable row level security;

create table if not exists public.course_qna (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.course_qna enable row level security;

create table if not exists public.course_announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

alter table public.course_announcements enable row level security;

-- ============================================================
-- WISHLIST
-- ============================================================
create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.wishlist enable row level security;

-- ============================================================
-- COUPONS
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
-- NOTIFICATIONS
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

-- ============================================================
-- LIVE CLASSES
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

-- ============================================================
-- SITE SETTINGS
-- ============================================================
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Plickify Academy',
  tagline text default 'শেখো, বেড়ে উঠো',
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, site_name) values (1, 'Plickify Academy')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- ============================================================
-- SITE CONTENT (home page / footer / nav editable content)
-- ============================================================
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content
  for select using (true);

drop policy if exists "site_content_app_admin_write" on public.site_content;
create policy "site_content_app_admin_write" on public.site_content
  for insert to authenticated with check (true);
drop policy if exists "site_content_app_admin_update" on public.site_content;
create policy "site_content_app_admin_update" on public.site_content
  for update to authenticated using (true) with check (true);
drop policy if exists "site_content_app_admin_delete" on public.site_content;
create policy "site_content_app_admin_delete" on public.site_content
  for delete to authenticated using (true);


-- ============================================================
-- HELPERS
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

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do nothing;

-- ============================================================
-- RLS POLICIES (drop + recreate for idempotency)
-- ============================================================
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- courses
drop policy if exists "Published courses are viewable by everyone" on public.courses;
create policy "Published courses are viewable by everyone"
  on public.courses for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert courses" on public.courses;
drop policy if exists "Admins and course owners can insert courses" on public.courses;
create policy "Admins and course owners can insert courses"
  on public.courses for insert
  with check (public.is_admin() or auth.uid() = created_by);

drop policy if exists "Only admins can update courses" on public.courses;
drop policy if exists "Admins and course owners can update courses" on public.courses;
create policy "Admins and course owners can update courses"
  on public.courses for update
  using (public.is_admin() or auth.uid() = created_by)
  with check (public.is_admin() or auth.uid() = created_by);

drop policy if exists "Only admins can delete courses" on public.courses;
drop policy if exists "Admins and course owners can delete courses" on public.courses;
create policy "Admins and course owners can delete courses"
  on public.courses for delete
  using (public.is_admin() or auth.uid() = created_by);

-- lessons
drop policy if exists "Lessons are viewable by everyone" on public.lessons;
create policy "Lessons are viewable by everyone"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Only admins can insert lessons" on public.lessons;
drop policy if exists "Course editors can insert lessons" on public.lessons;
create policy "Course editors can insert lessons"
  on public.lessons for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can update lessons" on public.lessons;
drop policy if exists "Course editors can update lessons" on public.lessons;
create policy "Course editors can update lessons"
  on public.lessons for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can delete lessons" on public.lessons;
drop policy if exists "Course editors can delete lessons" on public.lessons;
create policy "Course editors can delete lessons"
  on public.lessons for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.created_by = auth.uid()
    )
  );

-- enrollments
drop policy if exists "Users can view own enrollments" on public.enrollments;
create policy "Users can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can enroll themselves" on public.enrollments;
create policy "Users can enroll themselves"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can unenroll themselves" on public.enrollments;
create policy "Users can unenroll themselves"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- lesson_progress
drop policy if exists "Users can view own progress" on public.lesson_progress;
create policy "Users can view own progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own progress" on public.lesson_progress;
create policy "Users can insert own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.lesson_progress;
create policy "Users can update own progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- orders
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- course_sections
drop policy if exists "Sections are viewable by everyone" on public.course_sections;
create policy "Sections are viewable by everyone"
  on public.course_sections for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Only admins can insert sections" on public.course_sections;
drop policy if exists "Course editors can insert sections" on public.course_sections;
create policy "Course editors can insert sections"
  on public.course_sections for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can update sections" on public.course_sections;
drop policy if exists "Course editors can update sections" on public.course_sections;
create policy "Course editors can update sections"
  on public.course_sections for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can delete sections" on public.course_sections;
drop policy if exists "Course editors can delete sections" on public.course_sections;
create policy "Course editors can delete sections"
  on public.course_sections for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.created_by = auth.uid()
    )
  );

-- quiz_questions
drop policy if exists "Quiz questions are viewable by everyone" on public.quiz_questions;
create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (
    exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Only admins can insert quiz questions" on public.quiz_questions;
drop policy if exists "Course editors can insert quiz questions" on public.quiz_questions;
create policy "Course editors can insert quiz questions"
  on public.quiz_questions for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can update quiz questions" on public.quiz_questions;
drop policy if exists "Course editors can update quiz questions" on public.quiz_questions;
create policy "Course editors can update quiz questions"
  on public.quiz_questions for update
  using (
    public.is_admin() or exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can delete quiz questions" on public.quiz_questions;
drop policy if exists "Course editors can delete quiz questions" on public.quiz_questions;
create policy "Course editors can delete quiz questions"
  on public.quiz_questions for delete
  using (
    public.is_admin() or exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.created_by = auth.uid()
    )
  );

-- quiz_attempts
drop policy if exists "Users can view own quiz attempts" on public.quiz_attempts;
create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own quiz attempts" on public.quiz_attempts;
create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- user_course_state
drop policy if exists "Users can view own course state" on public.user_course_state;
create policy "Users can view own course state"
  on public.user_course_state for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own course state" on public.user_course_state;
create policy "Users can insert own course state"
  on public.user_course_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own course state" on public.user_course_state;
create policy "Users can update own course state"
  on public.user_course_state for update
  using (auth.uid() = user_id);

-- certificates
drop policy if exists "Users can view own certificates" on public.certificates;
create policy "Users can view own certificates"
  on public.certificates for select
  using (auth.uid() = user_id or public.is_admin());

-- reviews
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = reviews.course_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Enrolled users can insert reviews" on public.reviews;
create policy "Enrolled users can insert reviews"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and (
      public.is_admin()
      or exists (
        select 1 from public.enrollments e
        where e.user_id = auth.uid() and e.course_id = reviews.course_id
      )
    )
  );

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- course_qna
drop policy if exists "Q&A is viewable by everyone" on public.course_qna;
create policy "Q&A is viewable by everyone"
  on public.course_qna for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_qna.course_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Enrolled users can ask questions" on public.course_qna;
create policy "Enrolled users can ask questions"
  on public.course_qna for insert
  with check (
    auth.uid() = user_id
    and (
      public.is_admin()
      or exists (
        select 1 from public.enrollments e
        where e.user_id = auth.uid() and e.course_id = course_qna.course_id
      )
    )
  );

drop policy if exists "Question owner can update own question" on public.course_qna;
create policy "Question owner can update own question"
  on public.course_qna for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can delete own questions" on public.course_qna;
create policy "Users can delete own questions"
  on public.course_qna for delete
  using (auth.uid() = user_id or public.is_admin());

-- course_announcements
drop policy if exists "Announcements are viewable by everyone" on public.course_announcements;
create policy "Announcements are viewable by everyone"
  on public.course_announcements for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Only admins can insert announcements" on public.course_announcements;
drop policy if exists "Course editors can insert announcements" on public.course_announcements;
create policy "Course editors can insert announcements"
  on public.course_announcements for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can update announcements" on public.course_announcements;
drop policy if exists "Course editors can update announcements" on public.course_announcements;
create policy "Course editors can update announcements"
  on public.course_announcements for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can delete announcements" on public.course_announcements;
drop policy if exists "Course editors can delete announcements" on public.course_announcements;
create policy "Course editors can delete announcements"
  on public.course_announcements for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.created_by = auth.uid()
    )
  );

-- wishlist
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

-- coupons
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

-- notifications
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

-- live_classes
drop policy if exists "Live classes are viewable by everyone" on public.live_classes;
create policy "Live classes are viewable by everyone"
  on public.live_classes for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.is_published = true
    ) or public.is_admin()
  );

drop policy if exists "Only admins can insert live classes" on public.live_classes;
drop policy if exists "Course editors can insert live classes" on public.live_classes;
create policy "Course editors can insert live classes"
  on public.live_classes for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can update live classes" on public.live_classes;
drop policy if exists "Course editors can update live classes" on public.live_classes;
create policy "Course editors can update live classes"
  on public.live_classes for update
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Only admins can delete live classes" on public.live_classes;
drop policy if exists "Course editors can delete live classes" on public.live_classes;
create policy "Course editors can delete live classes"
  on public.live_classes for delete
  using (
    public.is_admin() or exists (
      select 1 from public.courses c
      where c.id = live_classes.course_id and c.created_by = auth.uid()
    )
  );

-- site_settings
drop policy if exists "Site settings are viewable by everyone" on public.site_settings;
create policy "Site settings are viewable by everyone"
  on public.site_settings for select
  using (true);

drop policy if exists "Only admins can update site settings" on public.site_settings;
create policy "Only admins can update site settings"
  on public.site_settings for update
  using (public.is_admin());

-- storage
drop policy if exists "Public read site-assets" on storage.objects;
create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "Public read course-images" on storage.objects;
create policy "Public read course-images"
  on storage.objects for select
  using (bucket_id = 'course-images');

drop policy if exists "Admins can insert site-assets" on storage.objects;
create policy "Admins can insert site-assets"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can update site-assets" on storage.objects;
create policy "Admins can update site-assets"
  on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can delete site-assets" on storage.objects;
create policy "Admins can delete site-assets"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can insert course-images" on storage.objects;
create policy "Admins can insert course-images"
  on storage.objects for insert
  with check (bucket_id = 'course-images' and public.is_admin());

drop policy if exists "Admins can update course-images" on storage.objects;
create policy "Admins can update course-images"
  on storage.objects for update
  using (bucket_id = 'course-images' and public.is_admin());

drop policy if exists "Admins can delete course-images" on storage.objects;
create policy "Admins can delete course-images"
  on storage.objects for delete
  using (bucket_id = 'course-images' and public.is_admin());

-- ============================================================
-- FKs: user_id -> public.profiles (fixes emails/names everywhere)
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