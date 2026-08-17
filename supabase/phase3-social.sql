-- Plickify Academy — Phase 3: Certificates + Reviews + Q&A + Announcements
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query) and press RUN.

-- ============================================================
-- 1. CERTIFICATES
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

-- issue function (security definer so users can create their own certificate)
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
-- 2. REVIEWS (ratings)
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

-- ============================================================
-- 3. COURSE Q&A
-- ============================================================
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

-- ============================================================
-- 4. COURSE ANNOUNCEMENTS
-- ============================================================
create table if not exists public.course_announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

alter table public.course_announcements enable row level security;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
-- certificates: owner or admin can view
create policy "Users can view own certificates"
  on public.certificates for select
  using (auth.uid() = user_id or public.is_admin());

-- reviews: published-course readers can view; enrolled users can write
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = reviews.course_id and c.is_published = true
    ) or public.is_admin()
  );

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

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- qna: published-course readers can view; enrolled users can ask
create policy "Q&A is viewable by everyone"
  on public.course_qna for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_qna.course_id and c.is_published = true
    ) or public.is_admin()
  );

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

create policy "Question owner can update own question"
  on public.course_qna for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can delete own questions"
  on public.course_qna for delete
  using (auth.uid() = user_id or public.is_admin());

-- announcements: published-course readers view; admins manage
create policy "Announcements are viewable by everyone"
  on public.course_announcements for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_announcements.course_id and c.is_published = true
    ) or public.is_admin()
  );

create policy "Only admins can insert announcements"
  on public.course_announcements for insert
  with check (public.is_admin());

create policy "Only admins can update announcements"
  on public.course_announcements for update
  using (public.is_admin());

create policy "Only admins can delete announcements"
  on public.course_announcements for delete
  using (public.is_admin());