-- Phase 2 — Hoàn tất setup cho user đã chạy 0003 trước (skip 0002 để tránh conflict policies)
-- Idempotent: chạy nhiều lần OK.
-- Apply: Supabase Dashboard → SQL Editor → paste & Run

-- ============================================================================
-- 1) Convert mood_entries.weather: text → text[]
-- ============================================================================
-- Idempotent: chỉ chạy nếu hiện tại weather là text (chưa convert)
do $$
declare
  current_type text;
begin
  select data_type into current_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'mood_entries'
    and column_name = 'weather';

  if current_type = 'text' then
    alter table public.mood_entries alter column weather drop default;
    alter table public.mood_entries
      alter column weather type text[]
      using case
        when weather is null or weather = '' then array[]::text[]
        else array[weather]
      end;
    alter table public.mood_entries alter column weather set default '{}'::text[];
    alter table public.mood_entries alter column weather set not null;
    raise notice 'mood_entries.weather đã chuyển từ text → text[]';
  else
    raise notice 'mood_entries.weather đã là %, skip', current_type;
  end if;
end $$;

-- ============================================================================
-- 2) Tạo buckets (nếu chưa có) — idempotent qua on conflict
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('mood-photos', 'mood-photos', false, 10 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars',     'avatars',     true,  5 * 1024 * 1024,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- 3) Verify
-- ============================================================================
select 'Buckets:' as info;
select id, name, public, file_size_limit from storage.buckets where id in ('mood-photos', 'avatars');

select 'mood_entries.weather column type:' as info;
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'mood_entries' and column_name = 'weather';
