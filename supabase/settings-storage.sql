-- Site Settings + Storage (incremental — if you already ran schema.sql)
-- Run this in the Supabase SQL editor.

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

drop policy if exists "Site settings are viewable by everyone" on public.site_settings;
create policy "Site settings are viewable by everyone"
  on public.site_settings for select
  using (true);

drop policy if exists "Only admins can update site settings" on public.site_settings;
create policy "Only admins can update site settings"
  on public.site_settings for update
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do nothing;

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