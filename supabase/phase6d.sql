-- ============================================================
-- PHASE 6D — Download history, Messages (student support inbox)
-- ============================================================

-- ------------------------------------------------------------
-- DOWNLOAD LOGS (per-user download history)
-- ------------------------------------------------------------
create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  resource_id uuid references public.lesson_resources (id) on delete set null,
  file_name text not null,
  created_at timestamptz not null default now()
);

alter table public.download_logs enable row level security;

create index if not exists download_logs_user_idx
  on public.download_logs (user_id, created_at desc);

-- ------------------------------------------------------------
-- CONVERSATIONS (student support threads)
-- ------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  subject text not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create index if not exists conversations_user_idx
  on public.conversations (user_id, last_message_at desc);

create index if not exists conversations_course_idx
  on public.conversations (course_id);

-- ------------------------------------------------------------
-- MESSAGES
-- ------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at asc);

-- ============================================================
-- RLS POLICIES (idempotent)
-- ============================================================

-- Downloads: owner sees own history
drop policy if exists "download_logs_owner_all" on public.download_logs;
create policy "download_logs_owner_all" on public.download_logs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Conversations: owner manages own threads
drop policy if exists "conversations_owner_all" on public.conversations;
create policy "conversations_owner_all" on public.conversations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Conversations: staff (course owner or admin) can read/update threads
drop policy if exists "conversations_staff_read" on public.conversations;
create policy "conversations_staff_read" on public.conversations
  for select to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = conversations.course_id and c.created_by = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "conversations_staff_update" on public.conversations;
create policy "conversations_staff_update" on public.conversations
  for update to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = conversations.course_id and c.created_by = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.courses c
      where c.id = conversations.course_id and c.created_by = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Messages: participants (owner or staff) can read, insert, update read state
drop policy if exists "messages_participant_select" on public.messages;
create policy "messages_participant_select" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations cv
      where cv.id = messages.conversation_id
        and (
          cv.user_id = auth.uid()
          or exists (
            select 1 from public.courses c
            where c.id = cv.course_id and c.created_by = auth.uid()
          )
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "messages_participant_insert" on public.messages;
create policy "messages_participant_insert" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations cv
      where cv.id = messages.conversation_id
        and (
          cv.user_id = auth.uid()
          or exists (
            select 1 from public.courses c
            where c.id = cv.course_id and c.created_by = auth.uid()
          )
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "messages_participant_update" on public.messages;
create policy "messages_participant_update" on public.messages
  for update to authenticated
  using (
    exists (
      select 1 from public.conversations cv
      where cv.id = messages.conversation_id
        and (
          cv.user_id = auth.uid()
          or exists (
            select 1 from public.courses c
            where c.id = cv.course_id and c.created_by = auth.uid()
          )
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  )
  with check (
    exists (
      select 1 from public.conversations cv
      where cv.id = messages.conversation_id
        and (
          cv.user_id = auth.uid()
          or exists (
            select 1 from public.courses c
            where c.id = cv.course_id and c.created_by = auth.uid()
          )
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );