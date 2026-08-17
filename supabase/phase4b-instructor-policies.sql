-- Plickify Academy — Phase 4b: Instructor policies
-- Grants course owners (instructors) the same write access admins have.
-- Run AFTER phase4-engagement.sql.

-- COURSES
drop policy if exists "Only admins can insert courses" on public.courses;
drop policy if exists "Only admins can update courses" on public.courses;
drop policy if exists "Only admins can delete courses" on public.courses;

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

-- QUIZ QUESTIONS (via lesson -> course)
drop policy if exists "Only admins can insert quiz questions" on public.quiz_questions;
drop policy if exists "Only admins can update quiz questions" on public.quiz_questions;
drop policy if exists "Only admins can delete quiz questions" on public.quiz_questions;

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

-- LIVE CLASSES
drop policy if exists "Only admins can insert live classes" on public.live_classes;
drop policy if exists "Only admins can update live classes" on public.live_classes;
drop policy if exists "Only admins can delete live classes" on public.live_classes;

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