-- Plickify Academy — Phase 1: Course Builder (Sections + Topics)
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query) and press RUN.

-- ============================================================
-- 1. COURSE SECTIONS (curriculum units — like Tutor LMS Sections)
-- ============================================================
create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_sections enable row level security;

-- ============================================================
-- 2. EXTEND LESSONS -> TOPICS (add section + type)
-- ============================================================
alter table public.lessons
  add column if not exists section_id uuid references public.course_sections (id) on delete cascade;

alter table public.lessons
  add column if not exists type text not null default 'lesson'
  check (type in ('lesson', 'quiz', 'assignment', 'video'));

create index if not exists lessons_section_id_idx on public.lessons (section_id);

-- ============================================================
-- 3. MIGRATE existing lessons into a default section per course
-- ============================================================
do $$
declare
  c record;
  s uuid;
begin
  for c in select id from public.courses loop
    select id into s from public.course_sections where course_id = c.id order by position limit 1;
    if s is null then
      insert into public.course_sections (course_id, title, position)
      values (c.id, 'Course Content', 0)
      returning id into s;
    end if;
    update public.lessons
      set section_id = s
      where course_id = c.id and section_id is null;
  end loop;
end $$;

-- also give every course a default section even if it has no lessons yet
insert into public.course_sections (course_id, title, position)
select c.id, 'Course Content', 0
from public.courses c
where not exists (select 1 from public.course_sections s where s.course_id = c.id);

-- ============================================================
-- 4. RLS POLICIES for sections (same pattern as courses/lessons)
-- ============================================================
create policy "Sections are viewable by everyone"
  on public.course_sections for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.is_published = true
    ) or public.is_admin()
  );

create policy "Only admins can insert sections"
  on public.course_sections for insert
  with check (public.is_admin());

create policy "Only admins can update sections"
  on public.course_sections for update
  using (public.is_admin());

create policy "Only admins can delete sections"
  on public.course_sections for delete
  using (public.is_admin());
