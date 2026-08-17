-- Plickify Academy — Phase 2: Quiz + Progress
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query) and press RUN.

-- ============================================================
-- 1. QUIZ QUESTIONS (question bank for quiz-type topics)
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

-- ============================================================
-- 2. QUIZ ATTEMPTS (results)
-- ============================================================
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

-- ============================================================
-- 3. LESSON EXTRAS: quiz pass % + drip release (days after enrollment)
-- ============================================================
alter table public.lessons
  add column if not exists pass_percent integer not null default 60;

alter table public.lessons
  add column if not exists release_days integer not null default 0;

-- ============================================================
-- 4. USER COURSE STATE (resume lesson tracking)
-- ============================================================
create table if not exists public.user_course_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  last_lesson_id uuid references public.lessons (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.user_course_state enable row level security;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
-- quiz_questions: readable when parent course is published; admin managed
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

create policy "Only admins can insert quiz questions"
  on public.quiz_questions for insert
  with check (public.is_admin());

create policy "Only admins can update quiz questions"
  on public.quiz_questions for update
  using (public.is_admin());

create policy "Only admins can delete quiz questions"
  on public.quiz_questions for delete
  using (public.is_admin());

-- quiz_attempts: user's own results (insert own too)
create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- user_course_state: user's own resume state
create policy "Users can view own course state"
  on public.user_course_state for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own course state"
  on public.user_course_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own course state"
  on public.user_course_state for update
  using (auth.uid() = user_id);