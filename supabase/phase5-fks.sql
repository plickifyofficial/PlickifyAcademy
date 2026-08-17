-- Plickify Academy — Phase 5: Add FK from user_id -> public.profiles
-- Tables currently reference auth.users only, so PostgREST joins like
-- `profiles(email)` / `profiles(full_name)` fail and return empty data.
-- Adding an FK to public.profiles (which is 1:1 with auth.users) fixes
-- admin enrollments emails, review/Q&A author names, and certificates.
-- Safe to run multiple times.

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