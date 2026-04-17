-- Tempo — Supabase schema
-- Run this in the Supabase SQL editor to enable real backend features

-- ── Profiles (extends Supabase auth.users) ───────────────────────────────────
create table profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  username     text unique not null,
  name         text not null,
  school_type  text check (school_type in ('middle','high','college')) default 'high',
  school_name  text default '',
  grade_year   text default '',
  bio          text default '',
  avatar_color text default '#7C3BFF',
  share_schedule boolean default true,
  share_gpa      boolean default false,
  created_at   timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ── GPA entries ───────────────────────────────────────────────────────────────
create table gpa_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  class_name text not null,
  grade      text not null,
  credits    numeric default 3,
  semester   text default '',
  created_at timestamptz default now()
);
alter table gpa_entries enable row level security;
create policy "Users manage own GPA" on gpa_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Friends can read GPA if shared" on gpa_entries for select
  using (
    auth.uid() = user_id
    or (
      select share_gpa from profiles where id = user_id
    ) = true
    and exists (
      select 1 from friend_requests
      where status = 'accepted'
      and ((from_id = auth.uid() and to_id = user_id)
        or (to_id = auth.uid() and from_id = user_id))
    )
  );

-- ── Friend requests ───────────────────────────────────────────────────────────
create table friend_requests (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid references profiles(id) on delete cascade,
  to_id      uuid references profiles(id) on delete cascade,
  status     text check (status in ('pending','accepted','declined','blocked')) default 'pending',
  created_at timestamptz default now(),
  unique(from_id, to_id)
);
alter table friend_requests enable row level security;
create policy "Users see their own requests" on friend_requests for select
  using (auth.uid() = from_id or auth.uid() = to_id);
create policy "Users send requests" on friend_requests for insert
  with check (auth.uid() = from_id);
create policy "Recipient can update status" on friend_requests for update
  using (auth.uid() = to_id);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table messages (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid references profiles(id) on delete cascade,
  to_id      uuid references profiles(id) on delete cascade,
  content    text not null,
  type       text default 'text' check (type in ('text','study_invite')),
  reaction   text,
  read       boolean default false,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Users see own messages" on messages for select
  using (auth.uid() = from_id or auth.uid() = to_id);
create policy "Users send messages to friends" on messages for insert
  with check (
    auth.uid() = from_id
    and exists (
      select 1 from friend_requests
      where status = 'accepted'
      and ((from_id = auth.uid() and to_id = messages.to_id)
        or (to_id = auth.uid() and from_id = messages.to_id))
    )
  );
create policy "Recipient can mark read" on messages for update
  using (auth.uid() = to_id);

-- ── Realtime (for live messaging) ─────────────────────────────────────────────
-- Enable in Supabase dashboard: Database → Replication → messages table
-- Then in your app:
--   const channel = supabase.channel('messages')
--     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
--         filter: `to_id=eq.${userId}` }, payload => { ... })
--     .subscribe()
