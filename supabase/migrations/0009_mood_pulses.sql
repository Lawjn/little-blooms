-- Sprint 1: pulse logging — multi-entry per day theo timestamp
-- Apply: Supabase Dashboard → SQL Editor → paste & Run.
--
-- Pulse là quick check-in trong ngày (mood + note + photos).
-- Khác main entry ở mood_entries:
-- - mood_entries: 1/user/day, full reflection (có tags + note + photos)
-- - mood_pulses: nhiều/user/day, light (mood + note + photos, không tags)

create table public.mood_pulses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  mood_level smallint not null check (mood_level between 1 and 5),
  note text,
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Index để query theo user + date range nhanh (Stats timeline)
create index idx_mood_pulses_user_logged_at
  on public.mood_pulses (user_id, logged_at desc);

-- RLS — full set: SELECT/INSERT/UPDATE/DELETE
alter table public.mood_pulses enable row level security;

create policy "Users can view own pulses"
  on public.mood_pulses for select
  using (auth.uid() = user_id);

create policy "Users can insert own pulses"
  on public.mood_pulses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pulses"
  on public.mood_pulses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own pulses"
  on public.mood_pulses for delete
  using (auth.uid() = user_id);

-- Verify
select 'mood_pulses created. policies:' as info;
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'mood_pulses'
order by policyname;
