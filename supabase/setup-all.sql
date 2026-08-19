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

alter table public.profiles
  add column if not exists avatar_url text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

-- Backfill Google avatars for existing users (Google stores it as
-- 'avatar_url' in raw_user_meta_data, sometimes 'picture')
update public.profiles p
set avatar_url = coalesce(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture',
  ''
)
from auth.users u
where p.id = u.id
  and (p.avatar_url is null or p.avatar_url = '');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
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
-- DIGITAL PRODUCTS
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null default 0,
  old_price numeric(10, 2) not null default 0,
  tag text,
  category text,
  product_type text,
  tags text[] not null default '{}',
  icon text not null default 'fa-solid fa-file',
  gradient text not null default 'from-blue-600 to-indigo-600',
  cover_image text,
  file_url text,
  file_format text,
  file_size text,
  file_count integer not null default 0,
  rating_avg numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  download_count integer not null default 0,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade existing products table (older schema) with new marketplace columns
alter table public.products add column if not exists category text;
alter table public.products add column if not exists product_type text;
alter table public.products add column if not exists tags text[] not null default '{}';
alter table public.products add column if not exists file_format text;
alter table public.products add column if not exists file_size text;
alter table public.products add column if not exists file_count integer not null default 0;
alter table public.products add column if not exists rating_avg numeric(3, 2) not null default 0;
alter table public.products add column if not exists review_count integer not null default 0;
alter table public.products add column if not exists download_count integer not null default 0;
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists is_bestseller boolean not null default false;

alter table public.products enable row level security;

-- Seed the default digital products so they appear in admin + on the site
insert into public.products (name, slug, description, price, old_price, tag, category, product_type, tags, icon, gradient, file_format, file_size, file_count, rating_avg, review_count, download_count, is_featured, is_bestseller, is_published)
values
  ('AI Prompt Pack', 'ai-prompt-pack', 'Content creation, graphic design, marketing এবং productivity-এর জন্য ready-to-use AI prompts-এর premium collection।', 490, 990, 'BEST SELLER', 'Prompt Packs', 'Prompt Pack', array['ai','prompts','chatgpt','marketing','design'], 'fa-solid fa-bolt', 'from-blue-600 to-indigo-600', 'PDF + TXT', '2 MB', 50, 4.9, 85, 1200, true, true, true),
  ('Canva Templates', 'canva-templates', 'Social media, business, presentation এবং marketing-এর জন্য premium Canva templates।', 690, 990, 'POPULAR', 'Canva Templates', 'Template', array['canva','design','social media','marketing'], 'fa-solid fa-palette', 'from-violet-600 to-fuchsia-600', 'Canva Link', '500 MB', 120, 4.8, 64, 980, false, true, true),
  ('AI Toolkit', 'ai-toolkit', 'AI productivity এবং content creation-এর জন্য essential tools।', 990, 1490, 'NEW', 'AI Tools', 'Toolkit', array['ai','tools','productivity'], 'fa-solid fa-toolbox', 'from-cyan-600 to-blue-700', 'PDF + LINKS', '10 MB', 200, 4.7, 40, 760, false, false, true),
  ('Freelance Guide eBook', 'freelance-guide-ebook', 'Freelancing শুরু করার complete beginner guide।', 390, 590, 'EBOOK', 'eBooks', 'eBook', array['freelancing','ebook','guide'], 'fa-solid fa-book', 'from-emerald-600 to-teal-600', 'PDF', '3 MB', 1, 4.9, 150, 2100, false, false, true),
  ('Social Media Design Pack', 'social-media-design-pack', 'Social media post templates, banners এবং editable assets।', 790, 1190, 'DESIGN', 'Design Resources', 'Design Asset', array['design','social media','templates','assets'], 'fa-solid fa-pen-ruler', 'from-rose-500 to-pink-600', 'Canva + PSD', '400 MB', 85, 4.6, 38, 540, false, false, true),
  ('Digital Marketing Toolkit', 'digital-marketing-toolkit', 'Marketing templates, checklists, prompts এবং resources।', 890, 1290, 'MARKETING', 'Marketing', 'Toolkit', array['marketing','templates','checklists','prompts'], 'fa-solid fa-bullhorn', 'from-amber-500 to-orange-600', 'PDF + XLSX', '8 MB', 45, 4.7, 52, 690, false, false, true),
  ('Content Creator Pack', 'content-creator-pack', 'Content prompts, planning templates এবং creator resources।', 590, 890, 'CONTENT', 'Content Creation', 'Course Resource', array['content','prompts','templates','creator'], 'fa-solid fa-wand-magic-sparkles', 'from-fuchsia-600 to-purple-700', 'PDF + Notion', '5 MB', 30, 4.8, 27, 410, false, false, true),
  ('Freelancing Proposal Pack', 'freelancing-proposal-pack', 'Proposal templates, client messages এবং outreach resources।', 490, 790, 'FREELANCING', 'Freelancing', 'Template', array['freelancing','proposal','client','outreach'], 'fa-solid fa-file-signature', 'from-slate-600 to-slate-800', 'DOCX + PDF', '4 MB', 25, 4.9, 71, 1330, false, true, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    old_price = excluded.old_price,
    tag = excluded.tag,
    category = excluded.category,
    product_type = excluded.product_type,
    tags = excluded.tags,
    file_format = excluded.file_format,
    file_size = excluded.file_size,
    file_count = excluded.file_count,
    rating_avg = excluded.rating_avg,
    review_count = excluded.review_count,
    download_count = excluded.download_count,
    is_featured = excluded.is_featured,
    is_bestseller = excluded.is_bestseller,
    updated_at = now();

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

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
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

-- products
drop policy if exists "Published products are viewable by everyone" on public.products;
create policy "Published products are viewable by everyone"
  on public.products for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert products" on public.products;
create policy "Only admins can insert products"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update products" on public.products;
create policy "Only admins can update products"
  on public.products for update
  using (public.is_admin());

drop policy if exists "Only admins can delete products" on public.products;
create policy "Only admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null default 'General Question',
  message text not null,
  status text not null default 'New' check (status in ('New', 'In Progress', 'Replied', 'Closed')),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Only admins can view contact messages" on public.contact_messages;
create policy "Only admins can view contact messages"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "Only admins can update contact messages" on public.contact_messages;
create policy "Only admins can update contact messages"
  on public.contact_messages for update
  using (public.is_admin());

drop policy if exists "Only admins can delete contact messages" on public.contact_messages;
create policy "Only admins can delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());

-- ============================================================
-- CONTENT MODULES: CATEGORIES / FAQS / TESTIMONIALS
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('course', 'product')),
  name text not null,
  slug text not null,
  icon text not null default 'fa-solid fa-tag',
  description text,
  image text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);

alter table public.categories enable row level security;

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  page text not null default 'homepage'
    check (page in ('homepage', 'courses', 'products', 'about', 'contact', 'global')),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  course text not null default '',
  quote text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  initials text not null default '',
  color text not null default 'bg-blue-600',
  avatar text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "Published categories are viewable by everyone" on public.categories;
create policy "Published categories are viewable by everyone"
  on public.categories for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert categories" on public.categories;
create policy "Only admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update categories" on public.categories;
create policy "Only admins can update categories"
  on public.categories for update
  using (public.is_admin());

drop policy if exists "Only admins can delete categories" on public.categories;
create policy "Only admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

drop policy if exists "Published faqs are viewable by everyone" on public.faqs;
create policy "Published faqs are viewable by everyone"
  on public.faqs for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert faqs" on public.faqs;
create policy "Only admins can insert faqs"
  on public.faqs for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update faqs" on public.faqs;
create policy "Only admins can update faqs"
  on public.faqs for update
  using (public.is_admin());

drop policy if exists "Only admins can delete faqs" on public.faqs;
create policy "Only admins can delete faqs"
  on public.faqs for delete
  using (public.is_admin());

drop policy if exists "Published testimonials are viewable by everyone" on public.testimonials;
create policy "Published testimonials are viewable by everyone"
  on public.testimonials for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert testimonials" on public.testimonials;
create policy "Only admins can insert testimonials"
  on public.testimonials for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update testimonials" on public.testimonials;
create policy "Only admins can update testimonials"
  on public.testimonials for update
  using (public.is_admin());

drop policy if exists "Only admins can delete testimonials" on public.testimonials;
create policy "Only admins can delete testimonials"
  on public.testimonials for delete
  using (public.is_admin());

insert into public.categories (type, name, slug, icon, description, sort_order)
select * from (values
  ('course', 'AI & Automation', 'ai-automation', 'fa-solid fa-robot', 'AI tools, automation এবং smart workflow।', 0),
  ('course', 'Freelancing', 'freelancing', 'fa-solid fa-briefcase', 'Marketplace, client communication এবং earning।', 1),
  ('course', 'Graphic Design', 'graphic-design', 'fa-solid fa-palette', 'AI-powered graphic design এবং creative skills।', 2),
  ('course', 'Digital Marketing', 'digital-marketing', 'fa-solid fa-bullhorn', 'Marketing, advertising এবং audience growth।', 3),
  ('course', 'Content Creation', 'content-creation', 'fa-solid fa-wand-magic-sparkles', 'Content strategy, AI content এবং creator workflow।', 4),
  ('course', 'Digital Business', 'digital-business', 'fa-solid fa-globe', 'Online business এবং digital income strategy।', 5),
  ('product', 'AI Tools', 'ai-tools', 'fa-solid fa-brain', 'AI productivity resources.', 0),
  ('product', 'Prompt Packs', 'prompt-packs', 'fa-solid fa-bolt', 'Ready-to-use AI prompts.', 1),
  ('product', 'Canva Templates', 'canva-templates', 'fa-solid fa-palette', 'Editable design templates.', 2),
  ('product', 'eBooks', 'ebooks', 'fa-solid fa-book', 'Practical digital guides.', 3),
  ('product', 'Freelancing', 'freelancing-products', 'fa-solid fa-briefcase', 'Freelancing resources.', 4),
  ('product', 'Design Resources', 'design-resources', 'fa-solid fa-wand-magic-sparkles', 'Premium creative assets.', 5)
) as v(type, name, slug, icon, description, sort_order)
where not exists (select 1 from public.categories);

insert into public.faqs (question, answer, page, sort_order)
select * from (values
  ('Plickify Academy কী?', 'Plickify Academy হলো AI, Freelancing, Digital Skills এবং Online Income শেখার জন্য একটি practical learning platform।', 'about', 0),
  ('এখানে কী ধরনের course পাওয়া যায়?', 'AI, Graphic Design, Freelancing, Digital Marketing, Content Creation এবং Digital Business sector-এর practical skill-based courses এবং live batch পাওয়া যায়।', 'about', 1),
  ('Course শেষ করলে certificate পাওয়া যাবে?', 'হ্যাঁ, course সফলভাবে শেষ করলে verifiable certificate দেওয়া হয়।', 'about', 2),
  ('Payment করার পর product কিভাবে পাবো?', 'Payment সফল হওয়ার সঙ্গে সঙ্গে আপনার account-এ product unlock হয়ে যাবে এবং dashboard থেকে download করতে পারবেন।', 'products', 0),
  ('Product কি instant download করা যাবে?', 'হ্যাঁ। Payment complete হওয়ার পরপরই instant download করার সুবিধা আছে।', 'products', 1),
  ('Course-এ কিভাবে ভর্তি হবো?', 'পছন্দের course-এ ভর্তি বাটনে ক্লিক করে checkout page থেকে payment complete করলেই ভর্তি হয়ে যাবেন।', 'courses', 0),
  ('Live class এবং recorded class দুটোই কি আছে?', 'হ্যাঁ। প্রতিটি course-এ recorded lessons থাকে এবং নির্দিষ্ট সময়ে live class হয়।', 'courses', 1),
  ('যোগাযোগের সেরা উপায় কী?', 'Contact page-এর form ব্যবহার করুন অথবা hello@plickifyacademy.com-এ email করুন।', 'contact', 0)
) as v(question, answer, page, sort_order)
where not exists (select 1 from public.faqs);

insert into public.testimonials (name, role, course, quote, rating, initials, color, sort_order)
select * from (values
  ('Rafiq Hasan', 'Freelancer', 'AI Income Mastery', 'কোর্স থেকে শেখা skill দিয়ে ফ্রিল্যান্সিং শুরু করেছি। প্রথম মাসেই ক্লায়েন্টের কাজ পেয়েছি।', 5, 'RH', 'bg-blue-600', 0),
  ('Nusrat Jahan', 'Social Media Designer', 'Design & AI', 'AI tools শিখে আমার ডিজাইন quality অনেক উন্নত হয়েছে। এখন নিজের portfolio দিয়ে কাজ করছি।', 5, 'NJ', 'bg-violet-600', 1),
  ('Tanvir Ahmed', 'YouTube Creator', 'AI Content Creation', 'AI workflow শিখে content তৈরি অনেক দ্রুত করছি। আগের চেয়ে অনেক বেশি consistent হতে পেরেছি।', 5, 'TA', 'bg-emerald-600', 2)
) as v(name, role, course, quote, rating, initials, color, sort_order)
where not exists (select 1 from public.testimonials);

-- ============================================================
-- LIVE BATCHES (Phase 2)
-- ============================================================
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  description text not null default '',
  start_date date,
  duration text not null default '',
  schedule text not null default '',
  class_count integer not null default 0,
  seats_total integer not null default 30,
  seats_filled integer not null default 0,
  price numeric(10,2) not null default 0,
  old_price numeric(10,2) not null default 0,
  status text not null default 'open'
    check (status in ('open', 'upcoming', 'ongoing', 'closed')),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  meeting_info text not null default '',
  features text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.batches enable row level security;

drop policy if exists "Published batches are viewable by everyone" on public.batches;
create policy "Published batches are viewable by everyone"
  on public.batches for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert batches" on public.batches;
create policy "Only admins can insert batches"
  on public.batches for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update batches" on public.batches;
create policy "Only admins can update batches"
  on public.batches for update
  using (public.is_admin());

drop policy if exists "Only admins can delete batches" on public.batches;
create policy "Only admins can delete batches"
  on public.batches for delete
  using (public.is_admin());

insert into public.batches (course_id, title, description, start_date, duration, schedule, class_count, seats_total, seats_filled, price, old_price, status, is_featured, is_published, features, sort_order)
select c.id, b.title, b.description, b.start_date, b.duration, b.schedule, b.class_count, b.seats_total, b.seats_filled, b.price, b.old_price, b.status, b.is_featured, b.is_published, b.features, b.sort_order
from (
  values
    ('AI Income Mastery Live Batch', 'AI tools, automation এবং freelancing-এর complete live training। Class recording সহ lifetime access।', '2026-10-01'::date, '3 Months', 'Weekly 2 Live Classes', 25, 40, 23, 4990, 7990, 'open', true, true, array['Weekly 2 Live Classes','Class Recording Included','Daily Homework & Practice','VIP Community Support','Resource Pack'], 0),
    ('Freelancing Masterclass Batch', 'Marketplace থেকে client পাওয়া থেকে payment নেওয়া — সবকিছু step-by-step।', '2026-11-05'::date, '2 Months', 'Weekly 1 Live Class', 10, 30, 12, 2990, 4990, 'upcoming', false, true, array['Live Class','Resume & Profile Review','Portfolio Guidance','Support Community'], 1),
    ('Graphic Design Pro Batch', 'AI-powered graphic design এবং client work-এর practical training।', '2026-09-01'::date, '2 Months', 'Weekly 2 Live Classes', 16, 35, 35, 3990, 5990, 'closed', false, true, array['Live Class','Design Assignments','Portfolio Feedback','Job-ready Skills'], 2)
  ) as b(title, description, start_date, duration, schedule, class_count, seats_total, seats_filled, price, old_price, status, is_featured, is_published, features, sort_order)
cross join lateral (
  select id from public.courses where is_published = true order by created_at limit 1
) c
where not exists (select 1 from public.batches);

-- ============================================================
-- INSTRUCTORS (Phase 2)
-- ============================================================
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  role text not null default '',
  bio text not null default '',
  photo text,
  initials text not null default '',
  color text not null default 'bg-blue-600',
  expertise text[] not null default '{}',
  facebook text not null default '',
  youtube text not null default '',
  linkedin text not null default '',
  instagram text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instructors enable row level security;

drop policy if exists "Published instructors are viewable by everyone" on public.instructors;
create policy "Published instructors are viewable by everyone"
  on public.instructors for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert instructors" on public.instructors;
create policy "Only admins can insert instructors"
  on public.instructors for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update instructors" on public.instructors;
create policy "Only admins can update instructors"
  on public.instructors for update
  using (public.is_admin());

drop policy if exists "Only admins can delete instructors" on public.instructors;
create policy "Only admins can delete instructors"
  on public.instructors for delete
  using (public.is_admin());

insert into public.instructors (name, slug, role, bio, initials, color, expertise, facebook, youtube, linkedin, is_featured, is_published, sort_order)
select * from (values
  ('মোঃ মিনহাজুল ইসলাম', 'minhajul-islam', 'Founder & Lead Instructor', 'AI, Design ও Freelancing-এ কাজের অভিজ্ঞতা নিয়ে শিক্ষার্থীদের practical skill শেখান।', 'MI', 'bg-blue-600', array['AI','Graphic Design','Freelancing','Digital Business'], '', '', '', true, true, 0),
  ('মোঃ সজীব শেখ', 'sojib-sheikh', 'Trainer & Mentor', 'শিক্ষার্থীদের hands-on training ও mentorship-এর মাধ্যমে skill develop করতে সাহায্য করেন।', 'SS', 'bg-violet-600', array['Digital Skills','Freelancing','AI Tools','Practical Training'], '', '', '', false, true, 1)
) as v(name, slug, role, bio, initials, color, expertise, facebook, youtube, linkedin, is_featured, is_published, sort_order)
where not exists (select 1 from public.instructors);

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

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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

-- ============================================================
-- STORE (Phase 3): product purchases + protected downloads
-- ============================================================

-- orders: support product purchases (course_id becomes optional)
alter table public.orders alter column course_id drop not null;
alter table public.orders add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.orders drop constraint if exists orders_item_check;
alter table public.orders add constraint orders_item_check check (course_id is not null or product_id is not null);
create index if not exists orders_product_id_idx on public.orders (product_id);

-- product purchases (entitlement record, mirrors enrollments for courses)
create table if not exists public.product_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.product_purchases enable row level security;

drop policy if exists "Users can view own purchases" on public.product_purchases;
create policy "Users can view own purchases"
  on public.product_purchases for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Only admins can insert purchases" on public.product_purchases;
create policy "Only admins can insert purchases"
  on public.product_purchases for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update purchases" on public.product_purchases;
create policy "Only admins can update purchases"
  on public.product_purchases for update
  using (public.is_admin());

drop policy if exists "Only admins can delete purchases" on public.product_purchases;
create policy "Only admins can delete purchases"
  on public.product_purchases for delete
  using (public.is_admin());

alter table public.product_purchases
  drop constraint if exists product_purchases_user_id_profiles_fkey;
alter table public.product_purchases
  add constraint product_purchases_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

-- private storage bucket for product files (served only via protected API route)
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

drop policy if exists "Admins can insert product-files" on storage.objects;
create policy "Admins can insert product-files"
  on storage.objects for insert
  with check (bucket_id = 'product-files' and public.is_admin());

drop policy if exists "Admins can update product-files" on storage.objects;
create policy "Admins can update product-files"
  on storage.objects for update
  using (bucket_id = 'product-files' and public.is_admin());

drop policy if exists "Admins can delete product-files" on storage.objects;
create policy "Admins can delete product-files"
  on storage.objects for delete
  using (bucket_id = 'product-files' and public.is_admin());

-- ============================================================
-- MARKETING (Phase 4): blog posts + newsletter subscribers
-- ============================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  cover_image text,
  author_name text not null default '',
  author_role text not null default '',
  tags text[] not null default '{}',
  reading_time text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

drop policy if exists "Published posts are viewable by everyone" on public.blog_posts;
create policy "Published posts are viewable by everyone"
  on public.blog_posts for select
  using (is_published = true or public.is_admin());

drop policy if exists "Only admins can insert posts" on public.blog_posts;
create policy "Only admins can insert posts"
  on public.blog_posts for insert
  with check (public.is_admin());

drop policy if exists "Only admins can update posts" on public.blog_posts;
create policy "Only admins can update posts"
  on public.blog_posts for update
  using (public.is_admin());

drop policy if exists "Only admins can delete posts" on public.blog_posts;
create policy "Only admins can delete posts"
  on public.blog_posts for delete
  using (public.is_admin());

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Only admins can view subscribers" on public.newsletter_subscribers;
create policy "Only admins can view subscribers"
  on public.newsletter_subscribers for select
  using (public.is_admin());

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists "Only admins can update subscribers" on public.newsletter_subscribers;
create policy "Only admins can update subscribers"
  on public.newsletter_subscribers for update
  using (public.is_admin());

drop policy if exists "Only admins can delete subscribers" on public.newsletter_subscribers;
create policy "Only admins can delete subscribers"
  on public.newsletter_subscribers for delete
  using (public.is_admin());

insert into public.blog_posts (title, slug, excerpt, body, cover_image, author_name, author_role, tags, reading_time, is_featured, is_published, published_at, view_count)
select * from (values
  ('AI ফ্রিল্যান্সিং শেখা শুরু করবেন যেভাবে', 'ai-freelancing-start-guide', 'AI tools শিখে ফ্রিল্যান্সিং শুরু করার step-by-step গাইড — প্রথম কাজ পাওয়া পর্যন্ত।', E'## শুরু করার আগে\n\nAI era-তে ফ্রিল্যান্সিং এখন আগের চেয়ে অনেক সহজ। তবে শুরু করার আগে কয়েকটা জিনিস জেনে নেওয়া জরুরি।\n\n- সঠিক skill select করুন\n- Portfolio তৈরি করুন\n- Marketplace-এ profile খুলুন\n\n**ধৈর্য ধরুন** — প্রথম ক্লায়েন্ট আসতে কিছুটা সময় লাগবে।\n\n## প্রথম কাজ পাওয়ার কৌশল\n\nRegular bid করুন, ভালো proposal লিখুন এবং রিভিউ নিয়ে কাজ করুন।', null, 'মোঃ মিনহাজুল ইসলাম', 'Founder & Lead Instructor', array['AI','Freelancing','Career'], '5 min', true, true, '2026-08-10T09:00:00Z'::timestamptz, 42),
  ('বাংলাদেশে AI Skill-এর চাহিদা ২০২৬', 'ai-skills-demand-2026', '২০২৬ সালে কোন AI skills সবচেয়ে বেশি চাহিদাসম্পন্ন এবং কীভাবে সেগুলো শিখবেন।', E'## বর্তমান বাজার\n\nAI-driven কাজের চাহিদা প্রতিনিয়ত বাড়ছে। ২০২৬-এ সবচেয়ে বেশি চাহিদা রয়েছে এই skills-গুলোতে:\n\n- AI content creation\n- Automation\n- AI-powered design\n\nআরও বিস্তারিত জানতে আমাদের live batch-এ যোগ দিন।', null, 'মোঃ সজীব শেখ', 'Trainer & Mentor', array['AI','Digital Skills','Market'], '4 min', false, true, '2026-08-15T09:00:00Z'::timestamptz, 27)
) as v(title, slug, excerpt, body, cover_image, author_name, author_role, tags, reading_time, is_featured, is_published, published_at, view_count)
where not exists (select 1 from public.blog_posts);

-- view counter for blog posts
create or replace function public.increment_blog_view(post_id uuid)
returns void
language sql security definer
set search_path = public
as $$
  update public.blog_posts set view_count = coalesce(view_count, 0) + 1 where id = post_id;
$$;