-- ============================================================
-- Phase 7: Blog ecosystem
-- Categories, tags, authors, comments, revisions, settings,
-- search analytics, feedback + extended blog_posts columns.
-- Idempotent — safe to re-run.
-- ============================================================

-- ---------- Categories ----------
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text,
  icon text,
  seo_title text,
  meta_description text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table public.blog_categories enable row level security;

drop policy if exists "public read active blog categories" on public.blog_categories;
create policy "public read active blog categories" on public.blog_categories
  for select using (is_active = true or public.is_admin());
drop policy if exists "admin insert blog categories" on public.blog_categories;
create policy "admin insert blog categories" on public.blog_categories
  for insert with check (public.is_admin());
drop policy if exists "admin update blog categories" on public.blog_categories;
create policy "admin update blog categories" on public.blog_categories
  for update using (public.is_admin());
drop policy if exists "admin delete blog categories" on public.blog_categories;
create policy "admin delete blog categories" on public.blog_categories
  for delete using (public.is_admin());

-- ---------- Tags ----------
create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);
alter table public.blog_tags enable row level security;

drop policy if exists "public read blog tags" on public.blog_tags;
create policy "public read blog tags" on public.blog_tags
  for select using (true or public.is_admin());
drop policy if exists "admin insert blog tags" on public.blog_tags;
create policy "admin insert blog tags" on public.blog_tags
  for insert with check (public.is_admin());
drop policy if exists "admin update blog tags" on public.blog_tags;
create policy "admin update blog tags" on public.blog_tags
  for update using (public.is_admin());
drop policy if exists "admin delete blog tags" on public.blog_tags;
create policy "admin delete blog tags" on public.blog_tags
  for delete using (public.is_admin());

-- ---------- Authors ----------
create table if not exists public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  photo text,
  bio text,
  role text,
  expertise text[] default '{}'::text[],
  socials jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.blog_authors enable row level security;

drop policy if exists "public read blog authors" on public.blog_authors;
create policy "public read blog authors" on public.blog_authors
  for select using (true or public.is_admin());
drop policy if exists "admin insert blog authors" on public.blog_authors;
create policy "admin insert blog authors" on public.blog_authors
  for insert with check (public.is_admin());
drop policy if exists "admin update blog authors" on public.blog_authors;
create policy "admin update blog authors" on public.blog_authors
  for update using (public.is_admin());
drop policy if exists "admin delete blog authors" on public.blog_authors;
create policy "admin delete blog authors" on public.blog_authors
  for delete using (public.is_admin());

-- ---------- Post <> Tag join ----------
create table if not exists public.blog_post_tags (
  post_id uuid references public.blog_posts(id) on delete cascade,
  tag_id uuid references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
alter table public.blog_post_tags enable row level security;

drop policy if exists "public read blog post tags" on public.blog_post_tags;
create policy "public read blog post tags" on public.blog_post_tags
  for select using (public.is_admin());
drop policy if exists "admin insert blog post tags" on public.blog_post_tags;
create policy "admin insert blog post tags" on public.blog_post_tags
  for insert with check (public.is_admin());
drop policy if exists "admin delete blog post tags" on public.blog_post_tags;
create policy "admin delete blog post tags" on public.blog_post_tags
  for delete using (public.is_admin());

-- ---------- Extend blog_posts ----------
alter table public.blog_posts
  add column if not exists category_id uuid references public.blog_categories(id) on delete set null;
alter table public.blog_posts
  add column if not exists author_id uuid references public.blog_authors(id) on delete set null;
alter table public.blog_posts
  add column if not exists status text default 'published';
alter table public.blog_posts
  add column if not exists scheduled_at timestamptz;
alter table public.blog_posts
  add column if not exists seo_title text;
alter table public.blog_posts
  add column if not exists meta_description text;
alter table public.blog_posts
  add column if not exists og_image text;
alter table public.blog_posts
  add column if not exists canonical_url text;
alter table public.blog_posts
  add column if not exists noindex boolean default false;
alter table public.blog_posts
  add column if not exists is_popular boolean default false;
alter table public.blog_posts
  add column if not exists is_trending boolean default false;
alter table public.blog_posts
  add column if not exists is_editors_pick boolean default false;
alter table public.blog_posts
  add column if not exists related_course_id uuid references public.courses(id) on delete set null;
alter table public.blog_posts
  add column if not exists related_product_ids jsonb default '[]'::jsonb;

-- Scheduled publishing helper: flips scheduled posts to published when due.
create or replace function public.flush_scheduled_posts()
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.blog_posts
  set status = 'published', is_published = true, published_at = scheduled_at, updated_at = now()
  where status = 'scheduled' and scheduled_at is not null and scheduled_at <= now();
end;
$$;

-- ---------- Comments ----------
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  parent_id uuid references public.blog_comments(id) on delete cascade,
  name text,
  email text,
  body text not null,
  status text default 'pending',
  is_reported boolean default false,
  report_count integer default 0,
  likes integer default 0,
  created_at timestamptz default now()
);
create index if not exists blog_comments_post_idx on public.blog_comments(post_id, status);
alter table public.blog_comments enable row level security;

drop policy if exists "public read approved blog comments" on public.blog_comments;
create policy "public read approved blog comments" on public.blog_comments
  for select using (status = 'approved' or public.is_admin());
drop policy if exists "public insert blog comments" on public.blog_comments;
create policy "public insert blog comments" on public.blog_comments
  for insert with check (true);
drop policy if exists "admin update blog comments" on public.blog_comments;
create policy "admin update blog comments" on public.blog_comments
  for update using (public.is_admin());
drop policy if exists "admin delete blog comments" on public.blog_comments;
create policy "admin delete blog comments" on public.blog_comments
  for delete using (public.is_admin());

-- ---------- Comment likes ----------
create table if not exists public.blog_comment_likes (
  comment_id uuid references public.blog_comments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (comment_id, user_id)
);
alter table public.blog_comment_likes enable row level security;

drop policy if exists "public read blog comment likes" on public.blog_comment_likes;
create policy "public read blog comment likes" on public.blog_comment_likes
  for select using (public.is_admin());
drop policy if exists "user insert blog comment like" on public.blog_comment_likes;
create policy "user insert blog comment like" on public.blog_comment_likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "user delete blog comment like" on public.blog_comment_likes;
create policy "user delete blog comment like" on public.blog_comment_likes
  for delete using (auth.uid() = user_id);

-- ---------- Post revisions ----------
create table if not exists public.blog_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  title text,
  excerpt text,
  body text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.blog_post_revisions enable row level security;

drop policy if exists "admin read blog revisions" on public.blog_post_revisions;
create policy "admin read blog revisions" on public.blog_post_revisions
  for select using (public.is_admin());
drop policy if exists "admin insert blog revisions" on public.blog_post_revisions;
create policy "admin insert blog revisions" on public.blog_post_revisions
  for insert with check (public.is_admin());
drop policy if exists "admin delete blog revisions" on public.blog_post_revisions;
create policy "admin delete blog revisions" on public.blog_post_revisions
  for delete using (public.is_admin());

-- ---------- Search analytics ----------
create table if not exists public.blog_search_logs (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  results_count integer default 0,
  created_at timestamptz default now()
);
alter table public.blog_search_logs enable row level security;

drop policy if exists "public insert blog search logs" on public.blog_search_logs;
create policy "public insert blog search logs" on public.blog_search_logs
  for insert with check (true);
drop policy if exists "admin read blog search logs" on public.blog_search_logs;
create policy "admin read blog search logs" on public.blog_search_logs
  for select using (public.is_admin());

-- ---------- Article feedback (was this helpful?) ----------
create table if not exists public.blog_post_feedback (
  post_id uuid references public.blog_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  helpful boolean not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table public.blog_post_feedback enable row level security;

drop policy if exists "user read own blog feedback" on public.blog_post_feedback;
create policy "user read own blog feedback" on public.blog_post_feedback
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "user insert blog feedback" on public.blog_post_feedback;
create policy "user insert blog feedback" on public.blog_post_feedback
  for insert with check (auth.uid() = user_id);
drop policy if exists "user update blog feedback" on public.blog_post_feedback;
create policy "user update blog feedback" on public.blog_post_feedback
  for update using (auth.uid() = user_id);

create or replace function public.blog_feedback_counts(p_post_id uuid)
returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'helpful', coalesce((select count(*) from public.blog_post_feedback where post_id = p_post_id and helpful), 0),
    'not_helpful', coalesce((select count(*) from public.blog_post_feedback where post_id = p_post_id and not helpful), 0)
  );
$$;

-- ---------- Seed default categories ----------
insert into public.blog_categories (name, slug, description, sort_order) values
  ('AI', 'ai', 'Artificial Intelligence, AI tools, automation এবং practical AI workflow নিয়ে আমাদের latest guides।', 1),
  ('Freelancing', 'freelancing', 'Fiverr, Upwork এবং freelancing-এর জন্য practical guides ও tips।', 2),
  ('Graphic Design', 'graphic-design', 'Design tools, techniques এবং creative workflow-এর guide।', 3),
  ('Digital Marketing', 'digital-marketing', 'Marketing, growth এবং brand building-এর latest strategies।', 4),
  ('Content Creation', 'content-creation', 'Content strategy, tools এবং creation workflow।', 5),
  ('Digital Business', 'digital-business', 'Online business, products এবং entrepreneurship।', 6),
  ('Online Income', 'online-income', 'Income sources এবং passive income ideas।', 7),
  ('Productivity', 'productivity', 'Time management এবং productivity-এর effective methods।', 8),
  ('Tutorials', 'tutorials', 'Step-by-step practical tutorials।', 9),
  ('Plickify Updates', 'plickify-updates', 'Plickify Academy-এর নতুন কোর্স, ফিচার এবং আপডেট।', 10)
on conflict (slug) do nothing;

-- Seed default author
insert into public.blog_authors (name, slug, photo, bio, role, expertise, socials) values (
  'মোঃ মিনহাজুল ইসলাম',
  'minhajul-islam',
  null,
  'Plickify Academy-এর Founder & Lead Instructor। AI, freelancing এবং digital skill development নিয়ে কাজ করছেন।',
  'Founder & Lead Instructor — Plickify Academy',
  array['AI','Freelancing','Digital Marketing','Content Creation'],
  '{"facebook":"","youtube":"","linkedin":"","instagram":""}'::jsonb
) on conflict (slug) do nothing;