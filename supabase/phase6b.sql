-- ============================================================
-- PHASE 6B — Course Player: completion rules, video position,
-- lesson notes, lesson resources, lesson comments
-- ============================================================

alter table public.lessons
  add column if not exists completion_rule text not null default 'manual'
  check (completion_rule in ('manual', 'video_percent'));

alter table public.lessons
  add column if not exists completion_percent integer not null default 80;

alter table public.lesson_progress
  add column if not exists position_seconds integer not null default 0;

alter table public.lesson_progress
  add column if not exists video_watch_seconds integer not null default 0;

alter table public.lesson_progress
  add column if not exists last_watched_at timestamptz;

alter table public.site_settings
  add column if not exists auto_next_lesson boolean not null default false;

-- ============================================================
-- LESSON NOTES (student personal notes per lesson)
-- ============================================================
create table if not exists public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  note text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_notes enable row level security;

-- ============================================================
-- LESSON RESOURCES (downloadable files per lesson)
-- ============================================================
create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  file_path text not null,
  file_type text,
  file_size text,
  created_at timestamptz not null default now()
);

alter table public.lesson_resources enable row level security;

create index if not exists lesson_resources_lesson_idx
  on public.lesson_resources (lesson_id);

-- ============================================================
-- LESSON COMMENTS (discussion)
-- ============================================================
create table if not exists public.lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

alter table public.lesson_comments enable row level security;

create index if not exists lesson_comments_lesson_idx
  on public.lesson_comments (lesson_id, created_at asc);

-- ============================================================
-- STORAGE BUCKET (private)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('lesson-resources', 'lesson-resources', false)
on conflict (id) do nothing;

-- ============================================================
-- RLS POLICIES (idempotent)
-- ============================================================
drop policy if exists "lesson_progress_user_all" on public.lesson_progress;
create policy "lesson_progress_user_all" on public.lesson_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "lesson_notes_user_all" on public.lesson_notes;
create policy "lesson_notes_user_all" on public.lesson_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "lesson_resources_enrolled_read" on public.lesson_resources;
create policy "lesson_resources_enrolled_read" on public.lesson_resources
  for select to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      join public.lessons l on l.course_id = e.course_id
      where l.id = lesson_resources.lesson_id and e.user_id = auth.uid()
    )
  );

drop policy if exists "lesson_comments_enrolled_all" on public.lesson_comments;
create policy "lesson_comments_enrolled_all" on public.lesson_comments
  for all to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      join public.lessons l on l.course_id = e.course_id
      where l.id = lesson_comments.lesson_id and e.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid() and
    exists (
      select 1
      from public.enrollments e
      join public.lessons l on l.course_id = e.course_id
      where l.id = lesson_comments.lesson_id and e.user_id = auth.uid()
    )
  );