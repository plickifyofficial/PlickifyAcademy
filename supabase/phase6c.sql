-- ============================================================
-- PHASE 6C — Assignments & Submissions
-- ============================================================

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  due_date timestamptz,
  total_points integer not null default 100,
  instructions text,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create index if not exists assignments_course_idx
  on public.assignments (course_id);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  submission_text text not null,
  attachment_path text,
  submitted_at timestamptz not null default now(),
  grade integer,
  feedback text,
  graded_at timestamptz,
  unique (assignment_id, user_id)
);

alter table public.assignment_submissions enable row level security;

create index if not exists assignment_submissions_lesson_idx
  on public.assignment_submissions (lesson_id, submitted_at desc);

-- ============================================================
-- RLS POLICIES (idempotent)
-- ============================================================

-- Students can read assignment metadata for courses they are enrolled in
drop policy if exists "assignments_enrolled_read" on public.assignments;
create policy "assignments_enrolled_read" on public.assignments
  for select to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = assignments.course_id and e.user_id = auth.uid()
    )
  );

-- Instructors/admins manage their own course assignments
drop policy if exists "assignments_owner_write" on public.assignments;
create policy "assignments_owner_write" on public.assignments
  for all to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = assignments.course_id
        and (c.created_by = auth.uid() or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  )
  with check (
    exists (
      select 1 from public.courses c
      where c.id = assignments.course_id
        and (c.created_by = auth.uid() or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

-- Students can read their own submissions; owners/admins can read/grage all
drop policy if exists "submissions_own_read" on public.assignment_submissions;
create policy "submissions_own_read" on public.assignment_submissions
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "submissions_student_write" on public.assignment_submissions;
create policy "submissions_student_write" on public.assignment_submissions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "submissions_student_update" on public.assignment_submissions;
create policy "submissions_student_update" on public.assignment_submissions
  for update to authenticated
  using (
    user_id = auth.uid() and grade is null
  )
  with check (
    user_id = auth.uid() and grade is null
  );

drop policy if exists "submissions_owner_read" on public.assignment_submissions;
create policy "submissions_owner_read" on public.assignment_submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.assignments a
      join public.courses c on c.id = a.course_id
      where a.id = assignment_submissions.assignment_id
        and (c.created_by = auth.uid() or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

drop policy if exists "submissions_owner_update" on public.assignment_submissions;
create policy "submissions_owner_update" on public.assignment_submissions
  for update to authenticated
  using (
    exists (
      select 1 from public.assignments a
      join public.courses c on c.id = a.course_id
      where a.id = assignment_submissions.assignment_id
        and (c.created_by = auth.uid() or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  )
  with check (
    exists (
      select 1 from public.assignments a
      join public.courses c on c.id = a.course_id
      where a.id = assignment_submissions.assignment_id
        and (c.created_by = auth.uid() or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );